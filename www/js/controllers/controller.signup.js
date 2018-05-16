angular.module('app.controllers')

.controller('SignUpCtrl', function ($scope, $state, $ionicLoading, Client, AuthService, GoogleOAuthService, $sim) {
    
	$scope.model = Client.createEmpty();
    
    $sim.getInfo().then(function(simData, error){
        if (!error) {
            $scope.model.phone = simData.phoneNumber;
        }
    });
    
    if ($scope.debug.enabled) {
        $scope.model.setData({
            first_name: 'John',
            last_name: 'Doe',
            //phone: '+123456789',
            email: 'm325917+lugnut@gmail.com',
            password: '12345',
            password2: '12345',
        });
    }
    
	$scope.signup = function () {
		
		$scope.error = null;
		$scope.processing = true;

		return $scope.model.save().then(function (client) {
            
            if (!client.hasErrors()) 
            {
                //$scope.success = 'Client is registration successfully!';
                AuthService.setIdentity(client);
                
                if (typeof AuthService.toBack === 'function') {
                    AuthService.toBack();
                } else {
                    $state.go('app.route-record');
                }
            }
            
		}).catch(function (error) {
			$scope.error = error;
		}).finally(function() {
			$scope.processing = false;
		});
	}
    
    
    
    /**
     * 
     * @return {undefined}
     */
    $scope.signUpWithGoogle = function () {

        $scope.loading = $ionicLoading.show({
            template: 'Logging in...'
        });
        
        return GoogleOAuthService.signUp().then(function(client){
            
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