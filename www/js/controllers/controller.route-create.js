angular.module('app.controllers')

.controller('RouteCreateCtrl', function ($scope, $rootScope, $state, AuthService, Config, $ionicPopup, $cordovaNetwork) {

    $scope.create = function (route) {
        
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
        } else {
        
            $scope.processing = true;
            route.user_id = $scope.identity.id;

            route.save().then(function(model){
                $scope.processing = false;
                var routeID = model.id;

                if (routeID !== -1) {
                    $state.go('app.route-view', {id: routeID})
                }
            });
        }
    };
    
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
    
    // todo:
    if (Config.debug.enabled) {
        $rootScope.route.setData({
            title: 'Test route #',
            city: 'New York',
            address: 'Main str. 1',
            company: 'Test Company',
            description: 'Lorem ipsum..',
        });
    }
});
