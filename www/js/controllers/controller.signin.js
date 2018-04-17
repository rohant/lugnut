angular.module('app.controllers')

.controller('SignInCtrl', function ($scope, $state, $log, AuthService, Client, $ionicLoading) {
	
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
    
    
	$scope.logoutFromGoogle = function () {
        window.plugins.googleplus.logout(function (message) {
            console.log(message);
            
            window.plugins.googleplus.disconnect(function (message) {
                console.log('googleplus.disconnect success',message);
            }, function (message) {
                console.log('googleplus.disconnect error',message);
            });
        });
	}
    
    /**
     * 
     * @return {undefined}
     */
    $scope.signInWithGoogle = function () {

        $scope.loading = $ionicLoading.show({
            template: 'Logging in...'
        });
        
        var setIdentity = function(userData)
        {
            console.log(userData);
            
            try {
                $scope.loading.hide();
            } catch (e) {
                $ionicLoading.hide();
            }
            
            var client = Client.createEmpty();

            client.setData({
                
                // todo:
                id: userData.userId,

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

            client.save().then(function (client) {
            
                if (!client.hasErrors()) 
                {
                    AuthService.setIdentity(client);

                    if (typeof $scope.toBack === 'function') {
                        $scope.toBack();
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
    }
});