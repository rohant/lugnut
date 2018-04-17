angular.module('app.controllers')

.controller('RouteListCtrl', function ($scope, $rootScope, $state, Route) {
    
    if (!$scope.auth.isLoggedIn()) {
        
        // set "to back" function
        $rootScope.toBack = function(){
            $rootScope.toBack = null;
            $state.go('app.list');
        }
        
        $state.go('app.signin');
    }
    
    $scope.reload = function(){
        var identity = $scope.auth.getIdentity();
        
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
    
    if ($scope.auth.isLoggedIn())
        $scope.reload();
});