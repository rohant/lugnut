angular.module('app.config', [])

.config(['$logProvider', function ($logProvider) {
    $logProvider.debugEnabled(true);
}])

.value('Config', {
    
    // Google Map API key
    API_KEY: 'AIzaSyDBbNcRgAaE9L4Q6IuAFchPqT1BA61kHvw',
    
    // server url
    //apiUrl: 'http://192.168.122.17/api/',
    apiUrl: 'http://lugnut.rmasyahin-wd.office.webdevs.us/api/',

    debug: {
        enabled: true,
        simulation: true,
        showPoints: false,
        snapToRoadEngine: 0,
    },
})