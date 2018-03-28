angular.module('app.controllers')

.controller('RouteListCtrl', function ($scope, $state, Route) {
    
    $scope.reload = function(){
        return Route.findAll().then(function(items){
            $scope.routes = items;

            //if (!items.langth) {
            //    $state.go('app.map')
            //}
        });
    }
    
    $scope.delete = function(route){
        return route.delete().then(function(){
            $scope.reload();
        });
    };
    
    $scope.reload();
});