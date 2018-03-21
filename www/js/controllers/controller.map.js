angular.module('app.controllers')

.controller('MapCtrl', function ($scope, $rootScope, $log, $http, $state, $ionicLoading, Gps, Marker, Route) {

    var watch;
    var infowindow, marker;

    var markers = [];
    var prevPosition;

    var waypoints = [];
    var tracewaypoints;

    var lines = []
    var snapPath = [];

    $scope.points = [];

    $scope.isWatching = false;
    $scope.showActions = false;

    $rootScope.routes = [];
    $rootScope.$watch('routes', function(routes){
        localStorage.setItem('routes', JSON.stringify(routes));
        $log.debug("routes:", routes);
    });

    $scope.$watch('debug.enabled', function(debug){
        Gps.simulation = debug && $scope.debug.simulation;
        $log.debug("debug.enabled:" + debug);
    });

    $scope.$watch('debug.simulation', function(simulation){
        Gps.simulation = simulation && $scope.debug.enabled;
        $log.debug("debug.simulation:" + Gps.simulation);
    });

    $scope.$watch('debug.showPoints', function(showPoints){
        $log.debug("debug.showPoins:" + showPoints);
    });

    /**
     *
     * @param {type} map
     * @return {undefined}
     */
    $scope.init = function (map) {

        Marker.init(map);

        $scope.showReloadBtn = false;

        $scope.loading = $ionicLoading.show({
            content: 'Getting current location...',
            showBackdrop: false
        });

        Gps.getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 30000,
            maximumAge: 0,
            //maximumAge: 60000,
        }).then(function (position) {
            $log.debug('Got position:', position);

            $scope.showActions = true;

            try {
                $scope.loading.hide();
            } catch (e) {
                $ionicLoading.hide();
            }

            var myLatlng = new google.maps.LatLng(
                position.coords.latitude,
                position.coords.longitude
            );

            $scope.map.setCenter(myLatlng);
            $scope.map.setZoom(15);

            Marker.current(position);

        }, function (error) {

            $log.error('Unable to get location: ' + error.message, error);

            $scope.showReloadBtn = true;

            try {
                $scope.loading.hide();
            } catch (e) {
                $ionicLoading.hide();
            }
        });
    }

    /**
     *
     * @param {type} map
     * @return {undefined}
     */
    $scope.mapCreated = function (map) {
        $scope.map = map;
        $scope.init(map);
    };

    /**
     *
     * @return {undefined}
     */
    $scope.watchPosition = function () {

        if (!$scope.map) {
            return;
        }

        if (!tracewaypoints) {
            tracewaypoints = new google.maps.Polyline({
                map: $scope.map,
                path: waypoints,
                strokeColor: "blue",
                strokeOpacity: 1.0,
                strokeWeight: 2
            });
        }

        $scope.route = Route.createEmpty();

        $scope.isWatching = true;

        if ($scope.debug.enabled && $scope.debug.simulation) {
            $log.info("Start simulation..");
        }

        $log.debug("Start route recording..");
        $log.debug("Search GPS coordinates..");

        //localStorage.setItem('points', []);

        function onSuccess (position) {
            $log.debug('Got position:', position);

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

            $scope.route.addPoint({
                lat: position.coords.latitude,
                lng: position.coords.longitude
            });

            Marker.current(position);

            $scope.map.setCenter(myLatlng);
        }

        function onError (error) {
            $log.error('Unable to get location: ' + error.message, error);
        }

        watch = Gps.watchPosition({
            enableHighAccuracy: true,
            maximumAge: 3600000,
            timeout: 30000,
        }).then(null, onError, onSuccess);
    }; 

    /**
     *
     * @return {undefined}
     */
    $scope.stopWatchingPosition = function(){
        $scope.isWatching = false;

        $log.debug('Stop route recording.');
        Gps.clearWatch(watch);

        $scope.route.title = 'Route ' + new Date().getTime();
        var routeId = $scope.route.save();

        if (routeId !== -1) {
            $state.go('app.view', {id: routeId})
        }


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

    $scope.$on("$destroy", function () {
        if (watch) {
            watch.clearWatch();
        }
    });
})
