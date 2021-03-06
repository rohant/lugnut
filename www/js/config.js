angular.module('app.config', ['app.services'])

.config(['$logProvider', function ($logProvider) {
    $logProvider.debugEnabled(true);
}])

//.config(['$ionicConfigProvider', function ($ionicConfigProvider) {
//    $ionicConfigProvider.views.maxCache(0);
//}])

.value('Config', {

    // Google Map API key
    API_KEY: 'AIzaSyDBbNcRgAaE9L4Q6IuAFchPqT1BA61kHvw',

    // server url
    // apiUrl: 'http://192.168.120.104/api/',
    apiUrl: 'http://lugnut.rmasyahin-wd.office.webdevs.us/api/',
})

.value('DebugMode', {
    enabled: false,
    simulation: false,
})

.config(function(FakeRoutesProvider) {

    FakeRoutesProvider
    .addRoute({
        active: true,
        name: 'Fake route #1',
        speed: 60,
        interval: 1500,
        points: [
            [37.803210, -122.285347],
            [37.803738, -122.287744],
            [37.808245, -122.286561],
            [37.809588, -122.286105],
            [37.809875, -122.287653],
            [37.810235, -122.289261],
            [37.810427, -122.291173],
            [37.811697, -122.290566],
            [37.813280, -122.290232],
            [37.816013, -122.289201],
            [37.816708, -122.287380],
            [37.815485, -122.284892],
            [37.815126, -122.283223],
            [37.814454, -122.280643],
            [37.814119, -122.278367]
        ]
    })
    .addRoute({
        name: 'Fake route #2',
        speed: 100,
        interval: 1000,
        points: [
            [37.805033, -122.293816],
            [37.805375, -122.294957],
            [37.805826, -122.297063],
            [37.806137, -122.298105],
            [37.807085, -122.297358],
            [37.808158, -122.296492],
            [37.809184, -122.295665],
            [37.810334, -122.294819],
            [37.811133, -122.292882],
            [37.810881, -122.291729],
            [37.810294, -122.289287],
            [37.811169, -122.288892],
            [37.811792, -122.288786],
            [37.811528, -122.287754],
            [37.811157, -122.286146]
        ]
    })
    .addRoute({
        name: 'Fake route #3',
        speed: 130,
        interval: 500,
        points: [
            [37.800735, -122.280453],
            [37.801057, -122.281212],
            [37.801487, -122.282307],
            [37.801912, -122.283260],
            [37.802308, -122.284205],
            [37.802833, -122.286292],
            [37.803049, -122.288690],
            [37.802909, -122.290948],
            [37.802341, -122.294311],
            [37.802142, -122.295996],
            [37.802367, -122.298603],
            [37.802998, -122.300497],
            [37.803702, -122.301704],
            [37.805143, -122.303324],
            [37.807152, -122.304397],
            [37.809266, -122.304560],
            [37.811945, -122.303407],
            [37.813312, -122.301882],
            [37.814493, -122.300388],
            [37.815841, -122.298461],
            [37.816692, -122.297300],
            [37.818334, -122.296253]
        ]
    });
})
