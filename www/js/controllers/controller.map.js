angular.module('app.controllers')

.controller('MapCtrl', function ($scope, $log, $ionicLoading, Gps) {
    
    var watch;
    var infowindow, marker;
    
    $scope.points = [];
    
    $scope.isWatching = false;
    $scope.isGotPosition = false;
    
    $scope.showReloadBtn = false;
    
    Gps.simulation = true;

    $scope.mapCreated = function (map) {
        
        $scope.map = map;
        
        $scope.loading = $ionicLoading.show({
            content: 'Getting current location...',
            showBackdrop: false
        });

        Gps.getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 30000,
            maximumAge: 60000,
        }).then(function (position) {

            $scope.isGotPosition = true;

            $log.debug('Got position:', position);

            $scope.loading.hide();

            var myLatlng = new google.maps.LatLng(
                position.coords.latitude,
                position.coords.longitude
            );

            $scope.map.setCenter(myLatlng);

            var geoInfo = (
                'Latitude: ' + position.coords.latitude + ";<br>\n" +
                'Longitude: ' + position.coords.longitude + ";<br>\n" +
                'Altitude: ' + position.coords.altitude + ";<br>\n" +
                'Accuracy: ' + position.coords.accuracy + ";<br>\n" +
                'Altitude Accuracy: ' + position.coords.altitudeAccuracy + ";<br>\n" +
                'Heading: ' + position.coords.heading + ";<br>\n" +
                'Speed: ' + position.coords.speed + ";<br>\n" +
                'Timestamp: ' + position.timestamp + ";<br>\n"
            );

            var label = 'Info:';
            var contentString = '<b>'+label+'</b><br>' + geoInfo;

            if (marker) {
                infowindow.setContent(contentString);
                marker.setPosition(myLatlng);
            } else {
                //marker = createMarker(myLatlng, 'Info:', geoInfo);

                marker = new google.maps.Marker({
                    position: myLatlng,
                    map: $scope.map,
                    title: label,
                    zIndex: Math.round(myLatlng.lat() * -100000) << 5
                });

                marker.myname = label;

                google.maps.event.addListener(marker, 'click', function (e) {
                    infowindow.setContent(contentString);
                    infowindow.open($scope.map, marker);
                    return true;
                });
            }
        }, function (error) {
            $log.error('Unable to get location: ' + error.message);
            $scope.loading.hide();
            $scope.showReloadBtn = true;
        });
    };

    $scope.watchPosition = function () {
        
        var _pos, _m = [];
        
        if (!$scope.map) {
            return;
        }
        
        $scope.isWatching = true;
        
        $log.debug("Start route recording..");
        
        if ($scope.debug.simulation) {
            $log.info("Start simulation..");
        }
        
        
        function onSuccess (position) {
            
            $log.debug('Got position:', position);

            var geoInfo = (
                'Latitude: ' + position.coords.latitude + ";<br>\n" +
                'Longitude: ' + position.coords.longitude + ";<br>\n" +
                'Altitude: ' + position.coords.altitude + ";<br>\n" +
                'Accuracy: ' + position.coords.accuracy + ";<br>\n" +
                'Altitude Accuracy: ' + position.coords.altitudeAccuracy + ";<br>\n" +
                'Heading: ' + position.coords.heading + ";<br>\n" +
                'Speed: ' + position.coords.speed + ";<br>\n" +
                'Timestamp: ' + position.timestamp + ";<br>\n"
            );

//            if (!_pos || (
//                Math.abs(_pos.coords.latitude - position.coords.latitude) > 0.000001
//            ) || (
//                Math.abs(_pos.coords.longitude - position.coords.longitude) > 0.000001
//            )) 
            {
                _pos = position;

                $scope.points.push({
                    latitude: _pos.coords.latitude,
                    longitude: _pos.coords.longitude
                });
            }
            
            var myLatlng = new google.maps.LatLng(
                position.coords.latitude,
                position.coords.longitude
            );
    
            infowindow = new google.maps.InfoWindow({
                size: new google.maps.Size(150, 50)
            });


            var label = 'Info:';
            var contentString = '<b>'+label+'</b><br>' + geoInfo;

            if (marker) {
                infowindow.setContent(contentString);
                marker.setPosition(myLatlng);
            } else {
                //marker = createMarker(myLatlng, 'Info:', geoInfo);

                marker = new google.maps.Marker({
                    position: myLatlng,
                    map: $scope.map,
                    title: label,
                    zIndex: Math.round(myLatlng.lat() * -100000) << 5
                });
                
                marker.myname = label;

                google.maps.event.addListener(marker, 'click', function (e) {
                    infowindow.setContent(contentString);
                    infowindow.open($scope.map, marker);
                    return true;
                });
            }
            
            localStorage.setItem('points', JSON.stringify($scope.points));
    
            $scope.map.setCenter(myLatlng);
        }
        
        function onError (error) {
            $log.error('Unable to get location: ' + error.message);
        }

        watch = Gps.watchPosition({
            enableHighAccuracy: true,
            timeout: 30000,
        }).then(onSuccess, onError);
    };
    
    $scope.stopWatchingPosition = function(){
        $scope.isWatching = false;
        
        $log.debug('Stop route recording.');
        
        Gps.clearWatch(watch);
        
        // do save route
    };
})
