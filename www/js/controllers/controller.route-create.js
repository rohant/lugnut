angular.module('app.controllers')

.controller('RouteCreateCtrl', function ($scope, $rootScope, $state) {

    $scope.create = function () {
        var routeID = $rootScope.route.save();

        if (routeID !== -1) {
            $state.go('app.view', {id: routeID})
        }
    }

});
