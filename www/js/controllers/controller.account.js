angular.module('app.controllers')

.controller('AccountCtrl', function ($scope, $state, AuthService, GoogleOAuthService) {
	$scope.auth = AuthService;
    
	$scope.logout = function () {
        return GoogleOAuthService.logout().finally(function () {
            return AuthService.logout().finally(function () {
                $state.go('app.signin');
            });
        });
	}
    
	$scope.$watch(AuthService.isLoggedIn, function (isLoggedIn) {
		$scope.isLoggedIn = isLoggedIn;
		$scope.identity = AuthService.getIdentity();
	});
});