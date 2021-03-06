angular.module('app.controllers')

.controller('RouteCreateCtrl', function ($injector, $scope, $rootScope, $state, $log, AuthService, DebugMode) {

    /**
     * TODO: remove it on production
     *
     * @param {boolean} enable
     * @return {undefined}
     */
    function test (enable) {

        if (!$rootScope.route) {
            $rootScope.route = $injector.get('Route').createEmpty();
        }

        if (!enable) {
            $rootScope.route.setData({
                title: '',
                city: '',
                address: '',
                company: '',
                description: '',
            });
        } else {
            $rootScope.route.setData({
                title: 'Test route #',
                city: 'New York',
                address: 'Main str. 1',
                company: 'Test Company',
                description: 'Lorem ipsum..',
            });
        }
    }

    // TODO: remove it on production
    $scope.$watch(function(){
        return DebugMode.enabled;
    }, function(_n,_o){
        test (_n)
    });


    $scope.create = function (route) {
        
        var $ionicPopup = $injector.get('$ionicPopup');
        var $cordovaNetwork = $injector.get('$cordovaNetwork');

        var isOffline = false;
        if (typeof Connection != 'undefined') {
            isOffline = $cordovaNetwork.isOffline();
        }

        if (isOffline) {

            $ionicPopup.confirm({
                title: "Internet is not working",
                content: "Internet is not working on your device."
            }).then(function(isOK){
                if (isOK) $scope.create(route);
            });

            $scope.$on('$cordovaNetwork:online', function(event, networkState) {
                $scope.create(route);
            });

        } else {

            $scope.processing = true;
            route.user_id = $scope.identity.id;

            route.save().then(function(model){

                var routeID = model.id;

                if (routeID !== -1) {
                    $rootScope.route = null;
                    $state.go('app.route-view', {id: routeID});
                }

            }).finally(function(){
                $scope.processing = false;
            });
        }
    };


    $scope.$on("$ionicView.beforeEnter", function (event) {

      test (DebugMode.enabled);

      if (!$rootScope.route)
          $state.go('app.list');

      if (!AuthService.isLoggedIn())
      {
          // set "to back" function
          AuthService.toBack = function(){
              AuthService.toBack = null;
              $state.go('app.route-create');
          }

          $state.go('app.signin');
      }
  });
});
