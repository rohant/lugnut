angular.module('app.controllers')

.controller('RouteDetailCtrl', function (
    $injector, 
    $scope, 
    $state, 
    $log, 
    $cordovaNetwork, 
    $ionicPopup, 
    $ionicNavBarDelegate, 
    $ionicHistory, 
    Route, 
    ApiService
) {
    
    /**
     * 
     * @return {undefined}
     */
    $scope.init = function () {
        
        Route.findOne($state.params.id).then(function (model) {
            $scope.model = model.with('user');

            ApiService.post('statistic/track-event', {
                entity: 'app\\models\\Route',
                entityID: model.id,
                eventType: 'route-details',
                eventData: {},
            });
            
        }).catch(function(response){
            //$scope.errorInternal(response.data);
            $scope.errorNoInternet();
        });
    }
    
    /**
     *
     * @return {undefined}
     */
    $scope.share = function(){

        var socShar = $injector.get('$cordovaSocialSharing');

        try {

            var viewUrl = 'http://lugnut.rmasyahin-wd.office.webdevs.us/route/' + $scope.model.id;

            var options = {
                //message: 'This is my message',
                //subject: 'Subject string',
                message: 'Detour: ' + $scope.model.title,
                subject: 'Share your detoure',
                files: ['', ''], // an array of filenames either locally or remotely
                url: viewUrl,
                //chooserTitle: 'Pick an app', // Android only, you can override the default share sheet title,
                //appPackageName: 'com.apple.social.facebook', // Android only, you can provide id of the App you want to share with
            };

            var onSuccess = function(result) {
                console.log("Share completed? " + result.completed); // On Android apps mostly return false even while it's true
                console.log("Shared to app: " + result.app); // On Android result.app since plugin version 5.4.0 this is no longer empty. On iOS it's empty when sharing is cancelled (result.completed=false)

                ApiService.post('statistic/track-event', {
                    entity: 'app\\models\\Route',
                    entityID: $scope.model.id,
                    eventType: 'route-share',
                    eventData: {},
                });
            };

            var onError = function(msg) {
                console.log("Sharing failed with message: " + msg);
            };

            socShar.shareWithOptions(options).then(onSuccess, onError);

        } catch (e) {
            // ignore
        }
    }
    
    /**
     * 
     * @return {unresolved}
     */
    $scope.errorNoInternet = function () {
        return $ionicPopup.confirm({
            title: "Internet is not working",
            content: "Internet is not working on your device. Please try again later."
        }).then(function(isOK){
            if (isOK) 
                $scope.init();
            else {
                if (!$scope.showBackButton) {
                    var $location = $injector.get('$location');
                    $location.path('/');
                } else {
                    $ionicHistory.goBack();
                }
            }
        });
    }
    
    /**
     * 
     * @param {Object} errorObj
     * @return {unresolved}
     */
    $scope.errorInternal = function (errorObj) {
        
        return $ionicPopup.confirm({
            title: 'Internal server error',
            content: 'Please try again later.'
        }).then(function(isOK){
            if (isOK) {
                $state.init();
            } else {
                if (!$scope.showBackButton) {
                    var $location = $injector.get('$location');
                    $location.path('/');
                } else {
                    $ionicHistory.goBack();
                }
            }
        });
    }

    var isOffline = false;
    if (typeof Connection != 'undefined') {
        isOffline = $cordovaNetwork.isOffline();
    }

    if (!isOffline) {
        $scope.init();
    } else {
        $scope.errorNoInternet();
    }
    
    $scope.$on("$ionicView.beforeEnter", function (event) {
        $scope.showBackButton = !!$ionicHistory.viewHistory().backView;
        $ionicNavBarDelegate.showBackButton($scope.showBackButton);
    });
    
    //$scope.$on('$cordovaNetwork:online', function(event, networkState) {
    //    $scope.init();
    //});
});
