angular.module('app.controllers')

.controller('RouteListCtrl', function ($scope, $state, Route) {
    Route.findAll().then(function(items){
        $scope.routes = items;

        //if (!items.langth) {
        //    $state.go('app.map')
        //}
    })
})