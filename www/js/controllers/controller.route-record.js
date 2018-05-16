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
//}, 1000));


angular.module('app.controllers')

.controller('RouteRecordCtrl', function ($scope, $rootScope, $log, $http, $state, $ionicLoading, Marker, Route, Geolocation, Config) {

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
            tracewaypoints = new google.maps.Polyline({
                map: $scope.map,
                path: waypoints,
                strokeColor: "blue",
                strokeOpacity: 1.0,
                strokeWeight: 2
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
