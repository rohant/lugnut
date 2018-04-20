angular.module('app.controllers')

.controller('AccountCtrl', function ($scope, $state, AuthService, GoogleOAuthService) {
	$scope.auth = AuthService;
    
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