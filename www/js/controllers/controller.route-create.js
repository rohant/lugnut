angular.module('app.controllers')

.controller('RouteCreateCtrl', function ($scope, $rootScope, $state) {

    if (!$rootScope.route)
        $state.go('app.list');
    
    // todo:
    if ($scope.$config.debug.enabled)
        $rootScope.route.title = 'Test route #';

    $scope.create = function (route) {
        route.save().then(function(model){
            var routeID = model.id;
            
            if (routeID !== -1) {
                $state.go('app.view', {id: routeID})
            }
        });
    };

});
