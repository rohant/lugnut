angular.module('app.controllers')

.controller('RouteListCtrl', function ($scope, $state, $injector, Route, AuthService) {
    
    $scope.isInit = false;
    
    $scope.reload = function(){
        var identity = AuthService.getIdentity();
        $scope.processing = true;
        
        var criteria = {
            user_id: identity.id
        };
        
        return Route.findAll(criteria).then(function(items){
            $scope.routes = items;
        }).catch(function(){
            $scope.errorNoInternet(function(){
                $scope.reload();
            });
        }).finally( function() {
            $scope.processing = false;
            if (!$scope.isInit) {
                $scope.isInit = true;
            }
        });
    }
    
    $scope.delete = function(route){
        $scope.processing = true;
        return route.delete().then(function(){
            $scope.reload();
        }).catch(function(){
            $scope.errorNoInternet(function(){
                $scope.delete(route);
            });
        }).finally(function(){
            $scope.processing = false;
        });
    };
    
    
    /**
     * 
     * @return {unresolved}
     */
    $scope.errorNoInternet = function (tryAgain) {
        var $ionicPopup = $injector.get('$ionicPopup');
        
        return $ionicPopup.confirm({
            title: "Internet is not working",
            content: "Internet is not working on your device. Please try again later."
        }).then(function(isOK){
            if (isOK) {
                tryAgain();
            } else {
                if (!$scope.showBackButton) {
                    var $location = $injector.get('$location');
                    $location.path('/');
                } else {
                    var $ionicHistory = $injector.get('$ionicHistory');
                    $ionicHistory.goBack();
                }
            }
        });
    }
    
    $scope.$on("$ionicView.enter", function (event) {
        
        if (AuthService.isLoggedIn()) {
            $scope.reload();
        } else {

            // set "to back" function
            AuthService.toBack = function(){
                AuthService.toBack = null;
                $state.go('app.route-list');
            }

            $state.go('app.signin');
        }
    })
});