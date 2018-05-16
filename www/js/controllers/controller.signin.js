angular.module('app.controllers')

.controller('SignInCtrl', function ($scope, $state, $log, $ionicLoading, AuthService, GoogleOAuthService) {
	
	$scope.auth = AuthService;
	
	$scope.model = {
		email: '',
		password: '',
	};

    // todo:
    if ($scope.debug.enabled) {
        $scope.model = {
            email: 'm325917+lugnut@gmail.com',
            password: '12345',
        };
    }
    
    /**
     * 
     * @return {unresolved}
     */
	$scope.signIn = function () {
		
		$scope.error = null;
		$scope.processing = true;

		return AuthService.logout().then(function () {
			return AuthService.signIn($scope.model).then(function (response) {
                
                if (typeof AuthService.toBack === 'function') {
                    AuthService.toBack();
                } else {
                    $state.go('app.route-record');
                }
			});
		}).catch(function (errors) {
			$scope.error = Object.values(errors).join(', ');
		}).finally(function(){
			$scope.processing = false;
		});
	}
    
    /**
     * 
     * @return {unresolved}
     */
    $scope.signInWithGoogle = function () {

        $scope.loading = $ionicLoading.show({
            template: 'Logging in...'
        });
        
        return GoogleOAuthService.signIn().then(function(client){
            AuthService.setIdentity(client);
            
            if (typeof AuthService.toBack === 'function') {
                AuthService.toBack();
            } else {
                $state.go('app.route-record');
            }
            
        }).finally(function() {
            
            try {
                $scope.loading.hide();
            } catch (e) {
                $ionicLoading.hide();
            }
        });
    }
});