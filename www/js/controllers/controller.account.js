angular.module('app.controllers')

.controller('AccountCtrl', function ($scope, $state, AuthService, GoogleOAuthService) {
	$scope.auth = AuthService;
    
    if (!AuthService.isLoggedIn()) {
        
        // set "to back" function
        AuthService.toBack = function(){
            AuthService.toBack = null;
            $state.go('app.account');
        }
        
        $state.go('app.signin');
    }
    
	$scope.logout = function () {
        return GoogleOAuthService.logout().then(function () {
            return AuthService.logout().then(function (response) {
                $state.go('app.signin');
            });
        });
	}
    
	$scope.$watch(AuthService.isLoggedIn, function (isLoggedIn) {
		$scope.isLoggedIn = isLoggedIn;
		$scope.identity = AuthService.getIdentity();
	});
});