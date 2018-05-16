angular.module('app.controllers')

.controller('RouteSearchCtrl', function ($scope, $state, Route, AuthService) {
    
    if (!AuthService.isLoggedIn()) {
        
        // set "to back" function
        AuthService.toBack = function(){
            AuthService.toBack = null;
            $state.go('app.route-search');
        }
        
        $state.go('app.signin');
    }
    
    $scope.criteria = {
        query: '',
    }
    
    $scope.reload = function(){
        $scope.processing = true;
        
        return Route.findAll($scope.criteria).then(function(items){
            $scope.processing = false;
            $scope.routes = items;
        });
    }
});