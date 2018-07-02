angular.module('app.controllers')

.controller('DashboardCtrl', function ($scope, $state, AuthService, Route) {

    function fetchViewedRoutes () {

        var _key = 'viewedRoutes';
        $scope.viewedRoutes = JSON.parse(localStorage.getItem(_key)) || [];

        var viewedIDs = $scope.viewedRoutes.map(function(viewed){
            return +viewed.id;
        });

        Route.findAll({id: viewedIDs}).then(function(items){
            $scope.viewedRoutes = items;
            localStorage.setItem(_key, JSON.stringify($scope.viewedRoutes));
        });
    }

    function fetchMyRoutes () {

        var identity = AuthService.getIdentity();

        var criteria = {
            user_id: identity.id,
            order: 'rating'
        };

        $scope.processing = true;

        Route.findAll(criteria).then(function(items){
            $scope.myRoutes = items;
            $scope.processing = false;
        });
    }


    $scope.$on("$ionicView.beforeEnter", function (event) {

        if (!AuthService.isLoggedIn()) {

            // set "to back" function
            AuthService.toBack = function(){
                AuthService.toBack = null;
                $state.go('app.dashboard');
            }

            $state.go('app.signin');
            return false;
        }

        fetchMyRoutes();
        fetchViewedRoutes();
    });
});
