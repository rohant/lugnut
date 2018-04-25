angular.module('app.controllers', [])

.controller('AppCtrl', function ($scope, $log, $state, $controller, Config, FakeRoutes) {
    $scope.platform = ionic.Platform.platform();
    $scope.$state = $state;
    
    $scope.$config = Config;
    $scope.debug = Config.debug;
    
    // todo: it must be refactored
    $controller('AccountCtrl', { $scope: $scope });
    
    $log.info('Start application!');
})

.controller('DebugCtrl', function ($scope, $log, FakeRoutes, Geolocation) {
    var $mapScope = angular.element('map').scope();
    var simulator = Geolocation.getGeolocationSimulator();
    
    $scope.fakeRoutes = FakeRoutes.getRoutes();
    $scope.fakeRoute = FakeRoutes.getActiveRoute();
    $scope.fakeRouteId = $scope.fakeRoute.id;
    
    $scope.setFakeRoute = function(route){route.apply()
        simulator.setFakeRoute(route.apply());
        $scope.fakeRouteId = route.id;
        $scope.fakeRoute = route;
        $mapScope.init();
    }
    
    $scope.$watch('debug.enabled', function(_n,_o){
        Geolocation.simulationEnabled(_n && $scope.debug.simulation);
        $log.debug("debug.enabled:" + _n);
        if (_n != _o) $mapScope.init();
    });

    $scope.$watch('debug.simulation', function(_n,_o){
        Geolocation.simulationEnabled(_n && $scope.debug.enabled);
        $log.debug("debug.simulation:" + Geolocation.simulation);
        if (_n != _o) $mapScope.init();
    });

    //$scope.$watch('debug.showPoints', function(showPoins){
    //    $log.debug("debug.showPoins:" + showPoins);
    //});
});