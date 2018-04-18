angular.module('app.controllers')

.controller('RouteCreateCtrl', function ($scope, $rootScope, $state, AuthService, Config) {

    $scope.create = function (route) {
        route.user_id = $scope.identity.id;
        
        route.save().then(function(model){
            var routeID = model.id;
            
            if (routeID !== -1) {
                $state.go('app.view', {id: routeID})
            }
        });
    };
    
    if (!$rootScope.route)
        $state.go('app.list');
    
    if (!AuthService.isLoggedIn())
    {
        // set "to back" function
        AuthService.toBack = function(){
            AuthService.toBack = null;
            $state.go('app.create');
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
