angular.module('app.controllers')

.controller('SignUpCtrl', function ($scope, $state, Client, AuthService) {
	$scope.model = Client.createEmpty();
    
    $scope.model.setData({
        first_name: 'John',
        last_name: 'Doe',
        phone: '+123456789',
        email: 'm325917+lugnut@gmail.com',
        password: '12345',
        password2: '12345',
    });

	$scope.signup = function () {
		
		$scope.error = null;
		$scope.processing = true;

		return $scope.model.save().then(function (client) {
            
            if (!client.hasErrors()) 
            {
                //$scope.success = 'Client is registration successfully!';
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
});