angular.module('app.controllers')

.controller('RouteListCtrl', function ($scope, $state, Route, AuthService) {
    
    $scope.reload = function(){
        var identity = AuthService.getIdentity();
        //$scope.processing = true;
        
        var criteria = {
            user_id: identity.id
        };
        
        return Route.findAll(criteria).then(function(items){
            $scope.routes = items;
            //$scope.processing = false;
        });
    }
    
    $scope.delete = function(route){
        $scope.processing = true;
        return route.delete().then(function(){
            $scope.processing = false;
            $scope.reload();
        });
    };
    
    $scope.$on("$ionicView.enter", function (event) {
        
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
    })
});