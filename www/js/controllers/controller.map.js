angular.module('app.controllers')

.controller('MapCtrl', function ($scope, $rootScope, $log, $http, $state, $ionicLoading, Gps, Marker, Route) {

    var watch, marker;
    var waypoints = [];
    var tracewaypoints;

    $scope.isWatching = false;
    $scope.showActions = false;

    $scope.$watch('debug.enabled', function(debug){
        Gps.simulation = debug && $scope.debug.simulation;
        $log.debug("debug.enabled:" + debug);
    });

    $scope.$watch('debug.simulation', function(_n,_o){
        Gps.simulation = _n && $scope.debug.enabled;
        $log.debug("debug.simulation:" + Gps.simulation);
        //if (_n != _o) $scope.init();
    });

    $scope.$watch('debug.showPoints', function(showPoins){
        $log.debug("debug.showPoins:" + showPoins);
    });

    /**
     *
     * @param {type} map
     * @return {undefined}
     */
    $scope.init = function () {
        $scope.map.setZoom(15);
        $scope.showReloadBtn = false;

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

        Gps.getCurrentPosition({
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

        if ($scope.debug.enabled && $scope.debug.simulation) {
            $log.info("Start simulation..");
        }

        watch = Gps.watchPosition({
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

    //            if (!prevPosition || (
    //                Math.abs(prevPosition.coords.latitude - position.coords.latitude) > 0.000001
    //            ) || (
    //                Math.abs(prevPosition.coords.longitude - position.coords.longitude) > 0.000001
    //            ))
    //            {
    //                prevPosition = new google.maps.LatLng(
    //                    position.coords.latitude,
    //                    position.coords.longitude
    //                );

    //                $scope.points.push({
    //                    latitude: prevPosition.coords.latitude,
    //                    longitude: prevPosition.coords.longitude
    //                });
    //            }

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

        Gps.clearWatch(watch);

        tracewaypoints.setPath([]);
        //tracewaypoints.setMap(null);

        //$scope.route.title = 'Route ' + new Date().getTime();
        //var routeId = $scope.route.save();

        //if (routeId !== -1) {
        //    $state.go('app.view', {id: routeId})
        //}

        $state.go('app.create')
    };

    $scope.$on("$destroy", function () {
        console.log('$destroy')
        if (watch) {
            watch.clearWatch(watch);
        }
    });
})
