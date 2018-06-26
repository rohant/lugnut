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

.controller('RouteRecordCtrl', function (
    $scope, 
    $rootScope, 
    $log, 
    $http, 
    $state, 
    $ionicLoading, 
    Marker, 
    Route, 
    Geolocation, 
    Config,
    AuthService
) {

    var watch, marker;
    var waypoints = [];
    var tracewaypoints;
    var predictPoints = [];

    
    $scope.isWatching = false;
    $scope.showActions = false;
    $scope.initialized = false;
    
    /**
     *
     * @param {type} map
     * @return {undefined}
     */
    $scope.init = function () {
        
        $scope.loading = $ionicLoading.show({
            template: 'Getting current location...',
            showBackdrop: true
        });
        
        Geolocation.getCurrentPosition({
            enableHighAccuracy: true,
            maximumAge: 6000,
            timeout: 30000,
        }).then(function (position) {
            
            $scope.initialized = true;
            
            $log.debug('Got position:', position);

            var myLatlng = new google.maps.LatLng(
                position.coords.latitude,
                position.coords.longitude
            );

            //$scope.map.setCenter(myLatlng);
            $scope.map.panTo(myLatlng);
            marker = Marker.current(position);

        }, function (error) {
            
            $log.error('Unable to get location: ' + error.message, error);
            
        }).finally(function(){
            
            $scope.showActions = true;
            
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
        
        Marker.init(map);
        $scope.map = map;
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


        if (!tracewaypoints) {
            tracewaypoints = new google.maps.Polyline({
                map: $scope.map,
                path: waypoints,
                strokeColor: "blue",
                strokeOpacity: 1.0,
                strokeWeight: 2
            });
        }
        
        //if (AuthService.isLoggedIn()) {
        //    $scope.init();
        //}
    };

    /**
     *
     * @return {undefined}
     */
    $scope.watchPosition = function () {

        if (!$scope.map) {
            return;
        }
        
        $scope.isWatching = true;
        
        $log.debug("Start route recording..");
        $log.debug("Search GPS coordinates..");

        if (Geolocation.simulationEnabled()) {
            $log.info("Start simulation..");
        }
        
        waypoints = [];
        tracewaypoints.setPath(waypoints);

        $rootScope.route = Route.createEmpty();

        watch = Geolocation.watchPosition({
            enableHighAccuracy: true,
            maximumAge: 3600000,
            timeout: 5000,
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

            //$scope.map.setCenter(myLatlng);
            $scope.map.panTo(myLatlng);
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
        
        Geolocation.clearWatch(watch);
        
        try { // TODO:
            watch && watch.clearWatch();
        } catch (e) {}
        
        
        waypoints = [];
        tracewaypoints.setPath([]);
        //tracewaypoints.setMap(null);

        //$scope.route.title = 'Route ' + new Date().getTime();
        //var routeId = $scope.route.save();

        //if (routeId !== -1) {
        //    $state.go('app.route-view', {id: routeId})
        //}
        
        
        for (var i in predictPoints) {
            predictPoints[i].setMap(null);
        }
        predictPoints = [];
        
        if ($scope.route.points.length > 3) {
            $log.debug('Saving route..');
            $state.go('app.route-create');
        }
    };

    
    $scope.$on("$ionicView.enter", function (event) {
        
        if (AuthService.isLoggedIn()) {
            if (!$scope.initialized) {
                $scope.init();
            }
        } else {
            // set "to back" function
            AuthService.toBack = function(){
                AuthService.toBack = null;
                $state.go('app.route-record');
            }

            $state.go('app.signin');
        }
        
        if (Geolocation.simulationEnabled()) {
            
            var fakeRoute = Geolocation
                .getGeolocationSimulator()
                .getFakeRoute();
        
            $log.info('Used the fake route: ' + fakeRoute.name);
        }
    });

    $scope.$on('$ionicView.leave', function(){
        // $scope.stopWatchingPosition();
    });
    
    $scope.$on("$destroy", function () {
        console.log('$destroy');
        
        $scope.stopWatchingPosition();
    });
})
