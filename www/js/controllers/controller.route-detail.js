angular.module('app.controllers')

.controller('RouteDetailCtrl', function ($injector, $scope, $state, $log, Route, ApiService) {
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
    
    /**
     * 
     * @return {undefined}
     */
    $scope.share = function(){
        
        var socShar = $injector.get('$cordovaSocialSharing');
        
        try {
            
            var viewUrl = 'http://lugnut.rmasyahin-wd.office.webdevs.us/route/' + $scope.model.id;
            
            var options = {
                message: 'This is my message',
                subject: 'Subject string',
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
            
            socShar.shareWithOptions(options, onSuccess, onError);
            
        } catch (e) {
            // ignore
        }
    }
});
