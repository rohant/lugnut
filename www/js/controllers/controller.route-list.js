angular.module('app.controllers')

.controller('RouteListCtrl', function ($scope, $state, Route, AuthService) {
    
    $scope.reload = function(){
        var identity = AuthService.getIdentity();
        
        var criteria = {
            user_id: identity.id
        };
        
        return Route.findAll(criteria).then(function(items){
            $scope.routes = items;
        });
    }
    
    $scope.delete = function(route){
        return route.delete().then(function(){
            $scope.reload();
        });
    };
    
    if (AuthService.isLoggedIn()) {
        $scope.reload();
    } else {
        
        // set "to back" function
        AuthService.toBack = function(){
            AuthService.toBack = null;
            $state.go('app.list');
        }
        
        $state.go('app.signin');
    }
});