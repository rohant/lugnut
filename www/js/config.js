angular.module('app.config', [])

.value('Config', {
    
    // Google Map API key
    API_KEY: 'AIzaSyDBbNcRgAaE9L4Q6IuAFchPqT1BA61kHvw',
    
    // server url
    apiUrl: 'http://www.lugnut.loc/',

    debug: {
        enabled: true,
        simulation: false,
        showPoints: false,
        snapToRoadEngine: 0,
    },

    simulate: {
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
    }
})

.config(['$logProvider', function ($logProvider) {
    $logProvider.debugEnabled(true);
}])
