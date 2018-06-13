angular.module('app.controllers')

.controller('RouteViewCtrl', function ($scope, $state, $log, $ionicLoading, $http, Route, Marker, Geolocation, Config) {
    
    var watch;
    
    var closedArrowIcon = {
        path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW
    };

    var busIcon = {
        path: 'M17.402,0H5.643C2.526,0,0,3.467,0,6.584v34.804c0,3.116,2.526,5.644,5.643,5.644h11.759c3.116,0,5.644-2.527,5.644-5.644 V6.584C23.044,3.467,20.518,0,17.402,0z M22.057,14.188v11.665l-2.729,0.351v-4.806L22.057,14.188z M20.625,10.773 c-1.016,3.9-2.219,8.51-2.219,8.51H4.638l-2.222-8.51C2.417,10.773,11.3,7.755,20.625,10.773z M3.748,21.713v4.492l-2.73-0.349 V14.502L3.748,21.713z M1.018,37.938V27.579l2.73,0.343v8.196L1.018,37.938z M2.575,40.882l2.218-3.336h13.771l2.219,3.336H2.575z M19.328,35.805v-7.872l2.729-0.355v10.048L19.328,35.805z',
        scale: .7,
        strokeColor: 'white',
        strokeWeight: .10,
        fillOpacity: 1,
        fillColor: '#404040',
        anchor: new google.maps.Point(10, 25)
    };
    
    $scope.mapCreated = function(map){
        $scope.map = map;
        $scope.map.setZoom(15);
        Marker.init(map);
        
        var bounds  = new google.maps.LatLngBounds();
        var path = [];
        
        
        $scope.$A = Marker.createMarker('Point A');
        $scope.$B = Marker.createMarker('Point B');
        $scope.$C = Marker.createMarker('Point C');
        
        $scope.$A.setAnimation(google.maps.Animation.DROP);
        $scope.$B.setAnimation(google.maps.Animation.DROP);
        //$scope.$C.setAnimation(google.maps.Animation.DROP);
        
        $scope.$A.setZIndex(2);
        $scope.$B.setZIndex(1);
        $scope.$C.setZIndex(1);
        
        $scope.$A.setIcon('./img/markers/blue_MarkerA.png');
        $scope.$B.setIcon('./img/markers/red_MarkerB.png');
        $scope.$C.setIcon(busIcon);
        
        
        $scope.loading = $ionicLoading.show({
            template: 'Wait...'
        });

        Route.findOne($state.params.id).then(function (model) {
            
            try {
                $scope.loading.hide();
            } catch (e) {
                $ionicLoading.hide();
            }
            
            $scope.model = model;
            var chunked = $scope.model.simplify().chunk(100);
            
            chunked.forEach(function(points, i){

                if (i-1 >= 0) {
                    points.unshift(chunked[i-1][chunked[i-1].length-1]);
                }

                var waypoints = points.map(function(point){
                    return [point.lat(), point.lng()].join(',')
                });

                if (waypoints.length) {
                    $http.get("https://roads.googleapis.com/v1/snapToRoads?interpolate=true&key="+$scope.$config.API_KEY+"&path="+waypoints.join('|'))
                    .then(function (response) {
                        $log.debug('snapToRoads:success', response)

                        var tmp = [];
                        for (var i in response.data.snappedPoints) {
                            var point = response.data.snappedPoints[i];
                            
                            var pointLatLng = new google.maps.LatLng(
                                point.location.latitude,
                                point.location.longitude
                            );
                    
                            tmp.push(pointLatLng);
                            bounds.extend(pointLatLng);
                        }

                        var tracewaypoints = new google.maps.Polyline({
                            map: $scope.map,
                            strokeColor: "blue",
                            strokeOpacity: 1.0,
                            strokeWeight: 2,
                            icons: [{
                                icon: closedArrowIcon,
                                offset: '100%'
                            }/*, {
                                icon: busIcon,
                                offset: '10%',
                            }*/]
                        });

                        path = path.concat(tmp);
                        tracewaypoints.setPath(tmp);
                        
                        $scope.map.fitBounds(bounds);      // auto-zoom
                        $scope.map.panToBounds(bounds);    // auto-center
                        
                        //$scope.map.setCenter(tmp[tmp.length-1]);
                        //$scope.map.setCenter(tmp[Math.ceil(tmp.length/2)]);

                        //Marker
                        //.createMarker('You are here!', tmp[tmp.length-1])
                        //.setPosition(tmp[tmp.length-1]);
                
                        $scope.$A.setPosition(tmp[0]);
                        $scope.$B.setPosition(tmp[tmp.length-1]);

                    }, function(response) {
                        $log.error('snapToRoads:error', response)
                    });
                }
            });
            
            $scope.watchPosition();
            $scope.watchDirection();
        });
    }
    
    /**
     *
     * @return {undefined}
     */
    $scope.watchPosition = function () {

        if (!$scope.map) {
            return;
        }

        // todo:
        //Geolocation.simulationEnabled(false);
        
        if (Geolocation.simulationEnabled()) {
            
            Geolocation
            .getGeolocationSimulator()
            .setFakeRoute({
                active: true,
                name: 'Fake route #1',
                speed: 60,
                interval: 500,
                points: [
                    [37.803210, -122.285347],
                ]
            });
        }

        $log.debug("Search GPS coordinates..");

        $scope.isWatching = true;

        watch = Geolocation.watchPosition({
            enableHighAccuracy: true,
            maximumAge: 3600000,
            timeout: 30000,
        }).then(null, onError, onSuccess);


        function onSuccess (position) {
            $log.debug('Got position:', position);

            var myLatlng = new google.maps.LatLng(
                position.coords.latitude,
                position.coords.longitude
            );
            var myLatlng = new google.maps.LatLng(
                position.coords.latitude,
                position.coords.longitude
            );
    
            $scope.$C.setPosition(myLatlng)
        }

        function onError (error) {
            $log.error('Unable to get location: ' + error.message, error);
        }
    };

    /**
     * 
     * @return {undefined}
     */
    $scope.watchDirection = function () {
        
        window.addEventListener("deviceorientation", throttle(function (event) {

            var alpha = event.webkitCompassHeading 
                ? event.webkitCompassHeading 
                : event.alpha;

            if (event.absolute) {
                //$log.info('Compass heading: ' + Math.floor(alpha))
                
                var icon = $scope.$C.getIcon()
                icon.rotation = 360 - alpha;
                $scope.$C.setIcon(icon)
            }

        }, 250));
    }

    /**
     *
     * @return {undefined}
     */
    $scope.stopWatchingPosition = function(){
        $scope.isWatching = false;
        Geolocation.clearWatch(watch);
    };

    $scope.$on("$destroy", function () {
        Geolocation.clearWatch(watch);
    });
    
    $scope.$on("$ionicView.enter", function (event) {
        if (Geolocation.simulationEnabled()) {
            
        }
    });
});
