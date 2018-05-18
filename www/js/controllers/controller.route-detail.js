angular.module('app.controllers')

.controller('RouteDetailCtrl', function ($scope, $state, $log, Route, ApiService) {
    $scope.model = null;
    
    Route.findOne($state.params.id).then(function (model) {
        $scope.model = model.with('user');
        
        ApiService.post('statistic/track-event', {
            entity: 'app\\models\\Route',
            entityID: model.id,
            eventType: 'route-view',
            eventData: {},
        });
    });
});
