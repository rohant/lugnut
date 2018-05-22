angular.module('app.controllers')

.controller('DashboardCtrl', function ($scope, $state, AuthService) {
	$scope.auth = AuthService;
    
    if (!AuthService.isLoggedIn()) {
        
        // set "to back" function
        AuthService.toBack = function(){
            AuthService.toBack = null;
            $state.go('app.dashboard');
        }
        
        $state.go('app.signin');
    }
});