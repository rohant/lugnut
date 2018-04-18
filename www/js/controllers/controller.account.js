angular.module('app.controllers')

.controller('AccountCtrl', function ($scope, $state, AuthService) {
	$scope.auth = AuthService;
    
	$scope.logout = function (model) {
        
        try {
            window.plugins.googleplus.logout(function (message) {
                console.log(message);
            });
            
            //window.plugins.googleplus.disconnect(function (message) {
            //    console.log('googleplus.disconnect',message); // do something useful instead of alerting
            //});
            
        } catch (e) {
            console.log(e)
        }
        
		return AuthService.logout().then(function (response) {
			$state.go('app.signin');
		});
	}
    
	$scope.$watch(AuthService.isLoggedIn, function (isLoggedIn) {
		$scope.isLoggedIn = isLoggedIn;
		$scope.identity = AuthService.getIdentity();
	});
});