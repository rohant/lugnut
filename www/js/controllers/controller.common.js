angular.module('app.controllers', [])

.controller('AppCtrl', function ($scope, $log, $state, $controller, Config, $gps) {
    $scope.$gps = $gps;
    $scope.$config = Config;
    $scope.$state = $state;
    $scope.debug = Config.debug;
    $scope.platform = ionic.Platform.platform();
    
    // todo: it must be refactored
    $controller('AccountCtrl', { $scope: $scope });
    
    $log.info('Start application!');
})

.controller('LogCtrl', function ($scope, $timeout, Logging) {
    $scope.logs = Logging.logs;

    $scope.$on('log:updated', function (event, data) {
        $scope.logs = data.logs;

        if(!$scope.$$phase) {
          $scope.$apply();
        }

        $timeout(function() {
          var scroller = document.getElementById("console");
          scroller.scrollTop = scroller.scrollHeight;
        }, 0, false);
    });

    $scope.cssClass = function (type) {
        var classList = {
            debug: '',
            error: 'assertive',
            warn: 'energized',
            info: 'positive',
        }
        return classList[type] || '';
    };
});