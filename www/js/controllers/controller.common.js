angular.module('app.controllers', [])

.controller('AppCtrl', function ($scope, $log, $ionicLoading, Config) {
    $scope.Config = Config;
    
    $scope.debug = {
        enabled:true
    };
    
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
})

//.controller('PlaylistsCtrl', function ($scope) {
//    $scope.playlists = [
//        {title: 'Reggae', id: 1},
//        {title: 'Chill', id: 2},
//        {title: 'Dubstep', id: 3},
//        {title: 'Indie', id: 4},
//        {title: 'Rap', id: 5},
//        {title: 'Cowbell', id: 6}
//    ];
//})
//
//.controller('PlaylistCtrl', function ($scope, $stateParams) {
//});
