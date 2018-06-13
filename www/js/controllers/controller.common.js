angular.module('app.controllers', [])

.controller('AppCtrl', function ($scope, $log, $state, $controller, Config) {
    $scope.platform = ionic.Platform.platform();
    $scope.$state = $state;
    $scope.$config = Config;
    
    // todo: it must be refactored
    $controller('AccountCtrl', { $scope: $scope });
    
    $log.info('Start application!');
})

.controller('DebugCtrl', function ($scope, $log, FakeRoutes, Geolocation, DebugMode) {
    var $mapScope = angular.element('map').scope();
    var simulator = Geolocation.getGeolocationSimulator();
    

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
            localStorage.setItem(this._key, JSON.stringify(data));
        },
    }
    
    cfg.fetch(function(data){
        angular.extend(DebugMode, data);
    })
    
    $scope.debug = DebugMode;
    $scope.fakeRoutes = FakeRoutes.getRoutes();
    $scope.fakeRoute = FakeRoutes.getActiveRoute();
    $scope.fakeRouteId = $scope.fakeRoute.id;
    
    $scope.setFakeRoute = function(route){
        simulator.setFakeRoute(route.apply());
        $scope.fakeRouteId = route.id;
        $scope.fakeRoute = route;
        $mapScope.init();
    }
    
    $scope.$watch('debug.enabled', function(_n,_o){
        $scope.debug.simulation = _n;
        Geolocation.simulationEnabled(_n);
        
        $log.debug("debug.enabled:" + _n);
        
        if (_n != _o) {
            if (angular.isFunction($mapScope.init)) {
                $mapScope.init();
            }
        }
        
        cfg.update($scope.debug);
    });

    $scope.$watch('debug.simulation', function(_n,_o){
        Geolocation.simulationEnabled(_n);
        
        $log.debug("debug.simulation:" + _n);
        if (_n != _o) {
            if (angular.isFunction($mapScope.init)) {
                $mapScope.init();
            }
        }
        
        cfg.update($scope.debug);
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