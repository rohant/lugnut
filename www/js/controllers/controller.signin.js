angular.module('app.controllers')

.controller('SignInCtrl', function ($scope, $state, AuthService) {
	
	$scope.auth = AuthService;
	
	$scope.model = {
		email: '',
		password: '',
	};

    // todo:
    $scope.model = {
		email: 'm325917+lugnut@gmail.com',
		password: '12345',
	};

	$scope.signin = function () {
		
		$scope.error = null;
		$scope.processing = true;

		return AuthService.logout().then(function () {
			return AuthService.login($scope.model).then(function (response) {
                
                if (typeof $scope.toBack === 'function') {
                    $scope.toBack();
                } else {
                    $state.go('app.map');
                }
			});
		}).catch(function (errors) {
			$scope.error = Object.values(errors).join(', ');
		}).finally(function(){
			$scope.processing = false;
		});
	}
});