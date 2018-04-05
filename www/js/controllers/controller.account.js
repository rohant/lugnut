angular.module('app.controllers')

.controller('AccountCtrl', function ($scope, $state, AuthService) {
	$scope.auth = AuthService;
    
	$scope.logout = function (model) {
        
        window.plugins.googleplus.logout(function (message) {
            console.log(message);
            
        });
        
		return AuthService.logout().then(function (response) {
			$state.go('app.signin');
		});
	}
    
//	$scope.logoutFromGoogle = function (model) {
//        
//        //window.plugins.googleplus.logout(function (message) {
//        //    alert(message); // do something useful instead of alerting
//        //});
//        
//        window.plugins.googleplus.disconnect(function (message) {
//            console.log('googleplus.disconnect',message); // do something useful instead of alerting
//        });
//	}
  
	$scope.$watch(AuthService.isLoggedIn, function (isLoggedIn) {
		$scope.isLoggedIn = isLoggedIn;
		$scope.identity = AuthService.getIdentity();
	});
});