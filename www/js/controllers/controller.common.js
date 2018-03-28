angular.module('app.controllers', [])

.controller('AppCtrl', function ($scope, $log, $state, Config) {
    $scope.$config = Config;
    $scope.$state = $state;
    $scope.debug = Config.debug;
    $scope.platform = ionic.Platform.platform();

    $log.info('Start application!');
})


//.controller('AccountCtrl', function ($scope, $state, AuthService) {
//	$scope.auth = AuthService;
//	
//	$scope.logout = function (model) {
//		return AuthService.logout().then(function (response) {
//			//$state.go('app.home');
//		});
//	}
//  
//	$scope.$watch(AuthService.isLoggedIn, function (isLoggedIn) {
//		$scope.isLoggedIn = isLoggedIn;
//		$scope.identity = AuthService.getIdentity();
//	});
//})
//
//
//.controller('LoginCtrl', function ($scope, $state, AuthService) {
//	
//	$scope.auth = AuthService;
//	
//	$scope.model = {
//		email: '',
//		password: '',
//	};
//
//	$scope.login = function () {
//		
//		$scope.error = null;
//		$scope.processing = true;
//
//		return AuthService.logout().then(function () {
//			return AuthService.login($scope.model).then(function (response) {
//				// do something
//			});
//		}).catch(function (errors) {
//			$scope.error = Object.values(errors).join(', ');
//		}).finally(function(){
//			$scope.processing = false;
//		});
//	}
//})
//
//.controller('RegCtrl', function ($scope, $state, Client, AuthService) {
//	$scope.model = Client.createEmpty();
//
//	$scope.registration = function () {
//		
//		$scope.error = null;
//		$scope.processing = true;
//
//		return $scope.model.save().then(function (client) {
//			$scope.success = 'Client is registration successfully!';
//			AuthService.setIdentity(client);
//		}).catch(function (error) {
//			$scope.error = error;
//		}).finally(function() {
//			$scope.processing = false;
//		});
//	}
//})


.controller('LogCtrl', function ($scope, $timeout, Logging) {
    $scope.logs = Logging.logs;

    $scope.$on('log:updated', function (event, data) {
        $scope.logs = data.logs;

        if(!$scope.$$phase) {
          $scope.$apply();
        }

        $timeout(function() {
          var scroller = document.getElementById("console");
          scroller.scrollTop = scroller.scrollHeight;
        }, 0, false);
    });

    $scope.cssClass = function (type) {
        var classList = {
            debug: '',
            error: 'assertive',
            warn: 'energized',
            info: 'positive',
        }
        return classList[type] || '';
    };
});