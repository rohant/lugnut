angular.module('app.controllers')

.controller('RouteSearchCtrl', function ($scope, $rootScope, $state, Route) {
    
    if (!$scope.auth.isLoggedIn()) {
        
        // set "to back" function
        $rootScope.toBack = function(){
            $rootScope.toBack = null;
            $state.go('app.search');
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