angular.module('app.controllers')

.controller('RouteDetailCtrl', function ($scope, $state, $log, Route, GoogleStaticMap) {
    $scope.model = null;
    
    Route.findOne($state.params.id).then(function (model) {
        $scope.model = model.with('user');
    });
});
