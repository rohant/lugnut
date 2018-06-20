angular.module('app.controllers')

.controller('DashboardCtrl', function ($scope, $state, AuthService, Route) {

    var _key = 'viewedRoutes';
    $scope.viewedRoutes = JSON.parse(localStorage.getItem(_key)) || [];
    
    if (!AuthService.isLoggedIn()) {
        
        // set "to back" function
        AuthService.toBack = function(){
            AuthService.toBack = null;
            $state.go('app.dashboard');
        }
        
        $state.go('app.signin');
        return false;
        
    }

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

    
    $scope.$parent.$on('$stateChangeStart', function() {
        $scope.viewedRoutes = JSON.parse(localStorage.getItem(_key)) || [];
    });
});