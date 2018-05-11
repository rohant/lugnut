//window.addEventListener("deviceorientation", throttle(function (event) {
//
//    var alpha = event.webkitCompassHeading 
//        ? event.webkitCompassHeading 
//        : event.alpha;
//
//    if (event.absolute) {
//        console.log('Compass direction:', getCompassDirection(Math.floor(alpha)), Math.floor(alpha));
//    }
//    
//}, 500));


angular.module('app.controllers')

.controller('MapCtrl', function ($scope, $rootScope, $log, $http, $state, $ionicLoading, Marker, Route, Geolocation, Config) {

    var watch, marker;
    var waypoints = [];
    var tracewaypoints;
    var predictPoints = [];

    // todo:
    Geolocation.simulationEnabled(true);
    
    $scope.isWatching = false;
    $scope.showActions = false;
    
    /**
     *
     * @param {type} map
     * @return {undefined}
     */
    $scope.init = function () {
        $scope.map.setZoom(15);
        $scope.showReloadBtn = false;

        //if (window.DeviceOrientationEvent) {
        //    window.addEventListener("deviceorientation", throttle(function (event) {
        //
        //        var alpha = event.webkitCompassHeading 
        //            ? event.webkitCompassHeading 
        //            : event.alpha;
        //
        //        if (event.absolute) {
        //            var angle = 360 - Math.floor(alpha);
        //            console.log("deviceorientation", angle);
        //
        //            if ($scope.map) {
        //                //$scope.map.setCompassEnabled(true);
        //                var heading = $scope.map.getHeading() || 0;
        //                $scope.map.setHeading(heading + angle);
        //            }
        //        }
        //
        //    }, 1000));
        //}


        $scope.loading = $ionicLoading.show({
            content: 'Getting current location...',
            showBackdrop: false
        });

        if (!tracewaypoints) {
            
            var closedArrowIcon = {
                path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW
            };
            
            tracewaypoints = new google.maps.Polyline({
                map: $scope.map,
                path: waypoints,
                strokeColor: "blue",
                strokeOpacity: 1.0,
                strokeWeight: 2,
                icons: [{
                    icon: closedArrowIcon,
                    offset: '100%'
                }]
            });
        }

        Geolocation.getCurrentPosition({
            enableHighAccuracy: true,
            maximumAge: 6000,
            timeout: 30000,
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
            marker = Marker.current(position);

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
        Marker.init(map);
        
        //$scope.watchDirection();
    };

    /**
     *
     * @return {undefined}
     */
    $scope.watchPosition = function () {

        $log.debug("Start route recording..");
        $log.debug("Search GPS coordinates..");

        if (!$scope.map) {
            return;
        }

        waypoints = [];
        tracewaypoints.setPath(waypoints);

        $rootScope.route = Route.createEmpty();
        $scope.isWatching = true;

        if (Config.debug.enabled && Config.debug.simulation) {
            $log.info("Start simulation..");
        }

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
    
            /**
             * Prediction the next position by Geohash algorithm
             * Measurement error: ~ 88m
             */
            //if (waypoints.length) 
            //{
            //    var lastPosition = waypoints[waypoints.length-1];
            //
            //    if (lastPosition) {
            //
            //        var spherical = google.maps.geometry.spherical;
            //
            //        //var averageDistance = tracewaypoints.inKm() / waypoints.length;
            //        var averageDistance = spherical.computeLength(tracewaypoints.getPath()) / waypoints.length;
            //        var precision = Geohash.precision(averageDistance, 7);
            //
            //        $log.info('Average distance: ' + averageDistance);
            //        $log.info('Precision: ' + precision);
            //
            //        var heading = spherical.computeHeading(lastPosition, myLatlng);
            //        heading = Math.abs(360 - Math.abs(heading));
            //
            //        var direction = getDirectionByAngle(heading);
            //        var geohash = Geohash.encode(myLatlng.lat(), myLatlng.lng(), precision);
            //
            //        try {
            //            var predictHash = Geohash.adjacent(geohash, direction.toLowerCase());
            //            var predictPoint = Geohash.decode(predictHash);
            //
            //            $log.info('Direction: ' + direction);
            //            $log.info('Predict point: ', predictPoint);
            //
            //            var ppM = Marker.createMarker('Predicted Point!');
            //            ppM.setIcon('./img/markers/yellow_MarkerB.png');
            //            ppM.setPosition(new google.maps.LatLng(
            //                predictPoint.lat, predictPoint.lon
            //            ));
            //
            //            predictPoints.push(ppM);
            //
            //        } catch (e) {}
            //    }
            //}
            
            $scope.route.addPoint({
                lat: position.coords.latitude,
                lng: position.coords.longitude
            });

            waypoints.push(myLatlng)
            tracewaypoints.setPath(waypoints);

            $scope.map.setCenter(myLatlng);
            Marker.current(position);
        }

        function onError (error) {
            $log.error('Unable to get location: ' + error.message, error);
        }
    };

    /**
     * 
     * @return {undefined}
     */
    //$scope.watchDirection = function () {
    //
    //    var busIcon = {
    //        path: 'M17.402,0H5.643C2.526,0,0,3.467,0,6.584v34.804c0,3.116,2.526,5.644,5.643,5.644h11.759c3.116,0,5.644-2.527,5.644-5.644 V6.584C23.044,3.467,20.518,0,17.402,0z M22.057,14.188v11.665l-2.729,0.351v-4.806L22.057,14.188z M20.625,10.773 c-1.016,3.9-2.219,8.51-2.219,8.51H4.638l-2.222-8.51C2.417,10.773,11.3,7.755,20.625,10.773z M3.748,21.713v4.492l-2.73-0.349 V14.502L3.748,21.713z M1.018,37.938V27.579l2.73,0.343v8.196L1.018,37.938z M2.575,40.882l2.218-3.336h13.771l2.219,3.336H2.575z M19.328,35.805v-7.872l2.729-0.355v10.048L19.328,35.805z',
    //        scale: .7,
    //        strokeColor: 'white',
    //        strokeWeight: .10,
    //        fillOpacity: 1,
    //        fillColor: '#404040',
    //        anchor: new google.maps.Point(10, 25)
    //    };
    //
    //    window.addEventListener("deviceorientation", throttle(function (event) {
    //
    //        var alpha = event.webkitCompassHeading 
    //            ? event.webkitCompassHeading 
    //            : event.alpha;
    //
    //        if (event.absolute) {
    //            $log.info('Direction: ' + getCompassDirection(Math.floor(alpha)) + ', ' + Math.floor(360-alpha))
    //
    //            if (marker) {
    //                busIcon.rotation = 360 - alpha;
    //                marker.setIcon(busIcon);
    //            }
    //        }
    //
    //    }, 500));
    //}

    /**
     *
     * @return {undefined}
     */
    $scope.stopWatchingPosition = function(){
        $scope.isWatching = false;

        $log.debug('Stop route recording.');
        $log.debug('Saving route..');

        Geolocation.clearWatch(watch);

        tracewaypoints.setPath([]);
        //tracewaypoints.setMap(null);

        //$scope.route.title = 'Route ' + new Date().getTime();
        //var routeId = $scope.route.save();

        //if (routeId !== -1) {
        //    $state.go('app.view', {id: routeId})
        //}
        
        
        for (var i in predictPoints) {
            predictPoints[i].setMap(null);
        }
        predictPoints = [];
        
        
        if ($scope.route.points.length > 3)
            $state.go('app.create')
    };

    $scope.$on("$destroy", function () {
        console.log('$destroy')
        
        Geolocation.clearWatch(watch);
        tracewaypoints.setPath([]);
    });
    
    $scope.$on("$ionicView.enter", function (event) {
        
        if ($scope.debug.simulation) {
            
            var fakeRoute = Geolocation
                .getGeolocationSimulator()
                .getFakeRoute();
        
            $log.info('Used the fake route: ' + fakeRoute.name);
        }
    });
})
