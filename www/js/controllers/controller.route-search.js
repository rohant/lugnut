angular.module('app.controllers')

.controller('RouteSearchCtrl', function ($scope, $state, $cordovaNetwork, $ionicPopup, Route, AuthService) {

    $scope.items = [];
    $scope.itemsPerPage = 20;
    $scope.currentPage = 0;
    
    $scope.criteria = {
        query: '',
        limit: $scope.itemsPerPage,
    }
    
    
    /**
     * 
     * @return {unresolved}
     */
    $scope.reload = function(){
        
        if ($cordovaNetwork.isOffline()) {
            $ionicPopup.alert({
                title: "Internet is not working",
                content: "Internet is not working on your device."
            }).then(function(result){
                $scope.reload();
            });
        } else {
        
            $scope.items = [];
            $scope.currentPage = 0;
            $scope.processing = true;
            $scope.criteria.offset = 0;
            $scope.canWeLoadMore = true;

            return Route.findAll($scope.criteria).then(function(items){
                $scope.items = items;
            }).finally(function(){
                $scope.processing = false;
            });
        }
    }
    
    /**
     * 
     * @param {Boolean} reload
     * @return {unresolved}
     */
    $scope.loadMore = function (reload) {
        $scope.currentPage++;
        //$scope.processing = true;
        $scope.criteria.offset = ($scope.currentPage * $scope.itemsPerPage);

        return Route.findAll($scope.criteria).then(function(items){
            $scope.canWeLoadMore = items.length;
            $scope.items = $scope.items.concat(items);
            $scope.$broadcast('scroll.infiniteScrollComplete');
        }).finally(function(){
            $scope.processing = false;
        });
    };
    
    
    if (!AuthService.isLoggedIn()) {
        
        // set "to back" function
        AuthService.toBack = function(){
            AuthService.toBack = null;
            $state.go('app.route-search');
        }
        
        $state.go('app.signin');
    }
    
    //$scope.$on('$stateChangeSuccess', function () {
    //    $scope.reload();
    //});
});