angular.module('app.controllers', [])

.controller('AppCtrl', function ($scope, $ionicLoading, Config) {
    $scope.debug = false;
    $scope.Config = Config;
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

.controller('LogCtrl', function ($scope, Logging) {
    
    $scope.logs = Logging.logs;
    
    $scope.$on('log:updated', function (event, data) {
        $scope.logs = data.logs;
        
        if(!$scope.$$phase) {
          $scope.$apply();
        }
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
