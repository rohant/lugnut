angular.module('app.controllers')

.controller('RouteRecordCtrl', function (
    $scope,
    $rootScope,
    $log,
    $injector,
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
        
        $scope.showReloadBtn = false;

        $scope.loading = $ionicLoading.show({
            template: 'Getting current location...',
            showBackdrop: true
        });

        return Geolocation.getCurrentPosition({
            timeout: 30000,
            enableHighAccuracy: true,
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
            
            return position;

        }).catch(function (error) {
            
            $scope.showReloadBtn = true;

            $log.error('Unable to get location: ' + error.message, error);

            try {
                // if GPS is disabled
                if (error.code === 2) {
                    var $ionicPopup = $injector.get('$ionicPopup');
                    
                    $ionicPopup.alert({
                        title: "Unable to get location.",
                        content: error.message + "<br>Turn on the GPS and try again."
                    }).then(function () {
                        $scope.init();
                    });
                }
            } catch(e) {
                // ignore
                console.log(e)
            }
            
            return error;

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

        if (!tracewaypoints) {
            tracewaypoints = new google.maps.Polyline({
                map: $scope.map,
                path: waypoints,
                strokeColor: "blue",
                strokeOpacity: 1.0,
                strokeWeight: 2
            });
        }
    };

    /**
     *
     * @return {undefined}
     */
    $scope.watchPosition = function () {

        if (!$scope.map) {
            return;
        }

        if (!$scope.isWatching) {
          $scope.isWatching = true;

          waypoints = [];
          tracewaypoints.setPath(waypoints);
          $rootScope.route = Route.createEmpty();
        }

        $log.debug("Start route recording..");
        $log.debug("Search GPS coordinates..");

        if (Geolocation.simulationEnabled()) {
            $log.info("Start simulation..");
        }

        watch = Geolocation.watchPosition({
            maximumAge: 3600000,
            //maximumAge: 3000,
            timeout: 5000,
            enableHighAccuracy: true,
            priority: 100,
            interval: 6000,
            fastInterval: 1000
        }).then(null, onError, onSuccess);

        function onSuccess (position) {

            $log.debug('Got position:', position);

            var myLatlng = new google.maps.LatLng(
                position.coords.latitude,
                position.coords.longitude
            );

            if (!$scope.route.points.length) {
                $scope.route.addPoint({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
            } else {

                var precision = 9;

                var currentGeoHash = Geohash.encode(
                    position.coords.latitude,
                    position.coords.longitude, precision);

                var lastGeohash = Geohash.encode(
                    $scope.route.points[$scope.route.points.length-1].lat,
                    $scope.route.points[$scope.route.points.length-1].lng, precision);

                if (currentGeoHash === lastGeohash) {
                    $log.info('Ignore point.')
                } else {
                    $scope.route.addPoint({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                }
            }

            waypoints.push(myLatlng);
            tracewaypoints.setPath(waypoints);

            //$scope.map.setCenter(myLatlng);
            $scope.map.panTo(myLatlng);
            Marker.current(position);
        }

        function onError (error) {
            $log.error('Unable to get location: ' + error.message, error);

            Geolocation.clearWatch(watch);

            try { // TODO:
                watch && watch.clearWatch();
            } catch (e) {}

            $scope.watchPosition();
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
            //if (!$scope.initialized) {
            if (!$scope.isWatching) {
                $scope.init();
            }
        } else {
            event.preventDefault();
            
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
