angular.module('app.controllers')

.controller('SignUpCtrl', function ($scope, $state, $ionicLoading, Client, AuthService, $sim) {
    
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
                    $state.go('app.map');
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
        
        var setIdentity = function(userData)
        {
            //console.log(userData);
            
            try {
                $scope.loading.hide();
            } catch (e) {
                $ionicLoading.hide();
            }
            
            var client = Client.createEmpty();

            client.setData({ 
                
                // todo:
                id: userData.userId,
                device_id: window.device.uuid,

                soc_id: userData.userId,
                soc_provider: Client.availableServices.GOOGLE_PLUS,
                soc_access_token: userData.accessToken,
                email: userData.email,
                first_name: userData.givenName,
                last_name: userData.familyName,
                imageUrl: userData.imageUrl,
                
                // todo:
                password: 12345,
            });

            $sim.getInfo().then(function(simData, error){
                
                if (!error) {
                    client.phone = simData.phoneNumber;
                }
                
                client.save().then(function (client) {

                    if (!client.hasErrors()) 
                    {
                        AuthService.setIdentity(client);

                        if (typeof AuthService.toBack === 'function') {
                            AuthService.toBack();
                        } else {
                            $state.go('app.map');
                        }
                    }

                }).catch(function (error) {
                    $scope.error = error;
                }).finally(function() {
                    $scope.processing = false;
                });
            
            });
        }
        
        try {
            
            window.plugins.googleplus.trySilentLogin({}, setIdentity, function (error) {
                console.log(error)

                try {
                    $scope.loading.hide();
                } catch (e) {
                    $ionicLoading.hide();
                }

                window.plugins.googleplus.login({}, setIdentity, function (error) {

                    try {
                        $scope.loading.hide();
                    } catch (e) {
                        $ionicLoading.hide();
                    }

                    console.log(error)
                });
            });
            
        } catch (e) {
            console.log(e)
        }
    }
});