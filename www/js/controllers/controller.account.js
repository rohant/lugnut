angular.module('app.controllers')

.controller('AccountCtrl', function ($scope, $state, AuthService) {
	$scope.auth = AuthService;
    
	$scope.logout = function (model) {
		return AuthService.logout().then(function (response) {
			$state.go('app.signin');
		});
	}
  
	$scope.$watch(AuthService.isLoggedIn, function (isLoggedIn) {
		$scope.isLoggedIn = isLoggedIn;
		$scope.identity = AuthService.getIdentity();
	});
});