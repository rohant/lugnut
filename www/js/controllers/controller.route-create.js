angular.module('app.controllers')

.controller('RouteCreateCtrl', function ($scope, $rootScope, $state) {

    // todo:
    $scope.route.setData({
        city: 'Lorem ipsum..',
        address: 'Lorem ipsum..',
    });

    if (!$scope.auth.isLoggedIn())
    {
        // set "to back" function
        $rootScope.toBack = function(){
            $rootScope.toBack = null;
            $state.go('app.create');
        }
        
        $state.go('app.signin');
        
    } else {
    
        if (!$rootScope.route)
            $state.go('app.list');

        // todo:
        if ($scope.$config.debug.enabled)
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
