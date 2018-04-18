angular.module('app.controllers')

.controller('RouteCreateCtrl', function ($scope, $rootScope, $state, AuthService) {

    // todo:
    if ($rootScope.debug.enabled) {
        $rootScope.route.setData({
            city: 'New York',
            address: 'Main str. 1',
            company: 'Test Company',
            description: 'Lorem ipsum..',
        });
    }

    if (!$scope.auth.isLoggedIn())
    {
        // set "to back" function
        AuthService.toBack = function(){
            AuthService.toBack = null;
            $state.go('app.create');
        }
        
        $state.go('app.signin');
        
    } else {
    
        if (!$rootScope.route)
            $state.go('app.list');

        // todo:
        if ($rootScope.debug.enabled)
            $rootScope.route.title = 'Test route #';
    }
    
    $scope.create = function (route) {
        route.user_id = $scope.identity.id;
        
        route.save().then(function(model){
            var routeID = model.id;
            
            if (routeID !== -1) {
                $state.go('app.view', {id: routeID})
            }
        });
    };

});
