angular.module('app.controllers', [])

.controller('AppCtrl', function ($scope, $log, $state, $controller, Config) {
    $scope.platform = ionic.Platform.platform();
    $scope.$state = $state;
    $scope.$config = Config;

    // todo: it must be refactored
    $controller('AccountCtrl', { $scope: $scope });

    $log.info('Start application!');
})

.controller('DebugCtrl', function ($scope, $log, $state, FakeRoutes, Geolocation, DebugMode) {
    var simulator = Geolocation.getGeolocationSimulator();

    /**
     *
     * @return {Boolean}
     */
    var mapInit = function () {

        var state = 'map[state-name="'+$state.current.name+'"]',
            $mapScope = angular.element(state).scope();

        if ([
            'app.route-record',
            'app.route-search-advanced',
        ].indexOf($state.current.name) == -1) {
            return false;
        }

        try {
            if (!angular.isUndefined($mapScope.init)
                && angular.isFunction($mapScope.init)) {
                $mapScope.init();
            }
        } catch(e) {}
    };


    // TODO: it must be refactored

    // config storage
    var cfg = {
        _key: 'debug',
        fetch: function(callback){
            var tmp = JSON.parse(localStorage.getItem(this._key));
            if (tmp) {
                angular.extend(this, tmp);
                callback(tmp);
            }
        },
        update: function(data){
            angular.extend(DebugMode, data);
            localStorage.setItem(this._key, JSON.stringify(data));
        },
    }

    cfg.fetch(function(data){
        angular.extend(DebugMode, data);
    });

    $scope.debug = DebugMode;
    $scope.fakeRoutes = FakeRoutes.getRoutes();
    $scope.fakeRoute = FakeRoutes.getActiveRoute();
    $scope.fakeRouteId = $scope.fakeRoute.id;

    $scope.setFakeRoute = function(route){
        simulator.setFakeRoute(route.apply());
        $scope.fakeRouteId = route.id;
        $scope.fakeRoute = route;
        mapInit();
    }

    $scope.$watch('debug.enabled', function(_n,_o){
        $log.debug("debug.enabled:" + _n);
        Geolocation.simulationEnabled(_n);

        if (_n != _o) {
            $scope.debug.simulation = _n;
            cfg.update($scope.debug);
            mapInit();
        }
    });

    $scope.$watch('debug.simulation', function(_n,_o){
        $log.debug("debug.simulation:" + _n);
        Geolocation.simulationEnabled(_n);

        if (_n != _o) {
            cfg.update($scope.debug);
            mapInit();
        }
    });

    //$scope.$watch('debug.showPoints', function(showPoins){
    //    $log.debug("debug.showPoins:" + showPoins);
    //});
})

.controller('ErrorNoInternet', function ($scope, $location) {
    $scope.$on('$cordovaNetwork:online', function(event, networkState) {
        $location.path('/');
    });
});
