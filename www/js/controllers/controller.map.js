angular.module('app.controllers')

.controller('MapCtrl', function ($scope, $log, $http, $ionicLoading, Gps) {
    
    var watch;
    var infowindow, marker;
    
    var markers = [];
    var prevPosition;
    
    var waypoints = [];
    var tracewaypoints = new google.maps.Polyline({
        path: waypoints,
        strokeColor: "blue",
        strokeOpacity: 1.0,
        strokeWeight: 2
    });
    
    var lines = []
    var snapPath = [];
    
    $scope.points = [];
    
    $scope.isWatching = false;
    $scope.isGotPosition = false;
    
    $scope.showReloadBtn = false;

    
    
    Gps.simulation = true;
    
    $scope.$watch('debug.simulation', function(enable){
        $log.debug("debug.simulation:"+enable);
        Gps.simulation = enable;
    })
    
    $scope.mapCreated = function (map) {
        
        $scope.map = map;
        $scope.points = [];
        
        tracewaypoints.setMap($scope.map);
        
        $scope.loading = $ionicLoading.show({
            content: 'Getting current location...',
            showBackdrop: false
        });

        Gps.getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 30000,
            maximumAge: 60000,
        }).then(function (position) {
            $log.debug('Got position:', position);

            $scope.isGotPosition = true;
            $scope.loading.hide();

            var myLatlng = new google.maps.LatLng(
                position.coords.latitude,
                position.coords.longitude
            );

            $scope.map.setCenter(myLatlng);
            $scope.map.setZoom(15);

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
        
        if (!$scope.map) {
            return;
        }
        
        $scope.isWatching = true;
        
        localStorage.setItem('points', []);
        
        
        $log.debug("Start route recording..");
        $log.debug("Search GPS coordinates..");
        
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


            var myLatlng = new google.maps.LatLng(
                position.coords.latitude,
                position.coords.longitude
            );


            if (+$scope.debug.snapToRoadEngine == 0) {
                waypoints.push(myLatlng)
                tracewaypoints.setPath(waypoints);
            } else {
                
                // working!
                
                if (+$scope.debug.snapToRoadEngine == 1)
                {
                    $log.debug('snapToRoadEngine => 1');
                    
                    if (!waypoints.length) {
                        waypoints.push(myLatlng);
                        //tracewaypoints.setPath(waypoints);
                    } else {
                        var service = new google.maps.DirectionsService()/*, snapPath = []*/;

                        service.route({
                            origin: waypoints[waypoints.length - 1],
                            destination: myLatlng,
                            travelMode: google.maps.DirectionsTravelMode.DRIVING
                        }, function (result, status) {
                            if (status == google.maps.DirectionsStatus.OK) {
                                snapPath = snapPath.concat(result.routes[0].overview_path);
                                
                                waypoints = snapPath;
                                
                                tracewaypoints.setPath(snapPath);
                            } else {
                                $log.error("Directions request failed: " + status);
                            }
                        });
                    }
                }
                
                
                // working!

                if (+$scope.debug.snapToRoadEngine == 2)
                {
                    $log.debug('snapToRoadEngine => 2');
                    
                    if (!waypoints.length) {
                        waypoints.push(myLatlng)
                        //tracewaypoints.setPath(waypoints);
                    } else {
                        var service = new google.maps.DirectionsService()/*, snapPath = []*/;

                        service.route({
                            origin: waypoints[waypoints.length - 1],
                            destination: myLatlng,
                            travelMode: google.maps.DirectionsTravelMode.DRIVING
                        }, function (result, status) {
                            if (status == google.maps.DirectionsStatus.OK) {
                                snapPath = snapPath.concat(result.routes[0].overview_path);

                                lines.push(new google.maps.Polyline({
                                    path: snapPath,
                                    map: $scope.map,
                                    strokeColor: "blue",
                                    strokeOpacity: 1.0,
                                    strokeWeight: 2
                                }));

                            } else {
                                $log.error("Directions request failed: " + status);
                            }
                        });

                        waypoints.push(myLatlng);
                    }
                }
                
                
                // working!
                
                if (+$scope.debug.snapToRoadEngine == 3)
                {
                    $log.debug('snapToRoadEngine => 3');
                    
                    var image = new google.maps.MarkerImage(
                        'http://maps.google.com/mapfiles/ms/micons/green-dot.png',
                        new google.maps.Size(32, 32),   // size
                        new google.maps.Point(0,0), // origin
                        new google.maps.Point(16, 32)   // anchor
                    );

                    var shadow = new google.maps.MarkerImage(
                        'http://maps.google.com/mapfiles/ms/micons/msmarker.shadow.png',
                        new google.maps.Size(59, 32),   // size
                        new google.maps.Point(0,0), // origin
                        new google.maps.Point(16, 32)   // anchor
                    );


                    if (!waypoints.length) {
                        waypoints.push(myLatlng)
                        tracewaypoints.setPath(waypoints);
                    } else {
                        var service = new google.maps.DirectionsService();

                        service.route({
                            origin: waypoints[waypoints.length - 1], 
                            destination: myLatlng,
                            travelMode: google.maps.DirectionsTravelMode.DRIVING
                        }, function (response, status) {
                            if (status == google.maps.DirectionsStatus.OK)
                            {
                                snapPath = snapPath.concat(response.routes[0].overview_path);
                                var point = response.routes[0].legs[0].start_location;

                                markers.push(new google.maps.Marker({
                                    position: point,
                                    map: $scope.map,
                                    title: "Check this cool location",
                                    icon: image,
                                    shadow: shadow,
                                    zIndex: Math.round(myLatlng.lat() * -100000) << 5
                                }));


                                //waypoints.push(point);

                                waypoints = snapPath;

                                //waypoints.push(response.routes[0].overview_path[0])
                                tracewaypoints.setPath(waypoints);  
                            }
                        });
                    }
                }
                
                
                
                if (+$scope.debug.snapToRoadEngine == 4)
                {
                    $log.debug('snapToRoadEngine => 4');
                    
                    if (!waypoints.length) {
                        waypoints.push(myLatlng)
                        //tracewaypoints.setPath(waypoints);
                    } else {
                    
                        var tmp = [];
                        for (var i in waypoints) {
                            tmp.push([
                                waypoints[i].lat(), 
                                waypoints[i].lng()
                            ].join(','));
                        }

                        $http.get("https://roads.googleapis.com/v1/snapToRoads?interpolate=true&key=AIzaSyDBbNcRgAaE9L4Q6IuAFchPqT1BA61kHvw&path="+tmp.join('|'))
                        .then(function (response) {
                            console.log('$http', response)

                            var tmp = [];
                            for (var i in response.data.snappedPoints) {
                                var point = response.data.snappedPoints[i];
                                
                                var _point = new google.maps.LatLng(
                                    point.location.latitude,
                                    point.location.longitude
                                );
                                

                                tmp.push(_point);

                                //waypoints.push(point);


                                tracewaypoints.setPath(tmp);  
                            }

                        }, function(response) {
                            console.log('$http', response)
                        });
                        
                        waypoints.push(myLatlng);
                    }
                }
                


    //            if (!prevPosition || (
    //                Math.abs(prevPosition.coords.latitude - position.coords.latitude) > 0.000001
    //            ) || (
    //                Math.abs(prevPosition.coords.longitude - position.coords.longitude) > 0.000001
    //            )) 
                {
    //                prevPosition = new google.maps.LatLng(
    //                    position.coords.latitude,
    //                    position.coords.longitude
    //                );

    //                $scope.points.push({
    //                    latitude: prevPosition.coords.latitude,
    //                    longitude: prevPosition.coords.longitude
    //                });
                }
            
            }
    
    
            $scope.map.setCenter(myLatlng);
            
            
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
        
        snapPath = [];
        
        waypoints = [];
        tracewaypoints.setPath(waypoints);
        //tracewaypoints.setMap(null);
        
        
        for(var i in markers){
            markers[i].setMap(null);
        }
        markers = [];
        
        
        
        for(var i in lines){
            lines[i].setMap(null);
        }
        lines = [];
        
        
        
        //
        //var tmp = [];
        //for (var i in waypoints) {
        //    tmp.push([
        //        waypoints[i].lat(), 
        //        waypoints[i].lng()
        //    ].join(','));
        //}
        //
        //tmp.length && $http.get("https://roads.googleapis.com/v1/snapToRoads?interpolate=true&key=AIzaSyDBbNcRgAaE9L4Q6IuAFchPqT1BA61kHvw&path="+tmp.join('|')).then(function (response) {
        //    console.log('$http', response)
        //
        //var tmp = [];
        //    for (var i in response.data.snappedPoints) {
        //        var point = response.data.snappedPoints[i];
        //
        //        waypoints.push(new google.maps.LatLng(
        //            point.location.latitude,
        //            point.location.longitude
        //        ));
        //
        //        //waypoints.push(point);
        //
        //
        //        tracewaypoints.setPath(waypoints);  
        //    }
        //
        //}, function(response) {
        //    console.log('$http', response)
        //});
        
        
        $log.debug('Saving route..');
    };
})
