angular.module('app.services')

.provider('FakeRoutes', function() {
    
    var routes = [];
    
    return {
        
        addRoute: function (route) {
            routes.push(route);
            return this;
        },
        
        $get: function(){
            return {
                getRoute: function(id){
                    return routes[id]
                },
                getRoutes: function(){
                    return routes;
                },
            };
        }
    };
})

.config(function(FakeRoutesProvider) {
    
    FakeRoutesProvider
    .addRoute({
        default: true,
        name: 'Fake route #1',
        speed: 60,
        interval: 2000,
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

.factory('GPSSimulator', function ($q, $log, $timeout, FakeRoutes) {
    
    console.log('FakeRoutes', FakeRoutes)
    
    
    return {}
    
    
    
    var simulator = {

        fakeID: 0,
        fakeRoutes: [],

        /**
         * 
         * @return {Array}
         */
        getFakeRoutes: function(){
            
//            for (var i in this.fakeRoutes) {
//                if (this.fakeRoutes[i].hasOwnProperty('default')) {
//                    this.fakeID = i;
//                }
//            }
            
            return this.fakeRoutes;
        },

        /**
         * 
         * @param {Integer} id
         * @return {Object}
         */
        getFakeRoute: function(id){
            return FakeRoutes.getRoute(id);
        },

        /**
         *
         * @return {unresolved}
         */
        getCurrentPosition: function () {//debugger;

            var route = this.getFakeRoute(this.fakeID);

            return $timeout(function(){}, +route.interval).then(function() {
                $log.debug('simulated current position.');

                return {
                    coords: {
                        accuracy: null,
                        altitude: null,
                        altitudeAccuracy: null,
                        heading: null,
                        latitude: route.points[0][0],
                        longitude: route.points[0][1],
                        speed: route.speed
                    },
                    timestamp: new Date().getTime(),
                    simulated: true
                }
            });
        },

        /**
         *
         * @return {unresolved}
         */
        watchPosition: function () {
            var deferred = $q.defer(), i = 0;
            var route = this.getFakeRoute(this.fakeID);

            var watcher = setInterval(function(){
                if (i > route.points.length-1) {
                    clearInterval(watcher);
                    $log.debug('end.');
                } else {
                    $log.debug('simulated position.', route.points[i]);

                    deferred.notify({
                        coords: {
                            accuracy: null,
                            altitude: null,
                            altitudeAccuracy: null,
                            heading: null,
                            latitude: route.points[i][0],
                            longitude: route.points[i][1],
                            speed: route.speed
                        },
                        timestamp: new Date().getTime(),
                        simulated: true
                    });

                    i++;
                }

            }, +route.interval);

            deferred.promise.clearWatch = function() {
                return clearInterval(watcher)
            };

            return deferred.promise;
        },
    };
    
    return simulator;
})

.factory('GPSEngineSwither', function ($q, $log, $cordovaGeolocation, GPSSimulator) {
    
    var gps = {

        simulation: false,
        simulator: GPSSimulator,

        /**
         * 
         * @param {Boolean} enable
         * @return {gps}
         */
        simulationEnabled: function(enable){
            this.simulation = enable;
            return this;
        },

        /**
         * 
         * @return {simulator|$cordovaGeolocation}
         */
        getSource: function(){
            var deferred = $q.defer();

            ionic.Platform.ready(function() {
                var source = this.simulation ? this.simulator : $cordovaGeolocation;
                deferred.resolve(source);
            });

            //return this.simulation ? this.simulator : $cordovaGeolocation;

            return deferred.promise;
        },

        /**
         *
         * @return {unresolved}
         */
        getCurrentPosition: function () {//debugger;
            return this.getSource().then(function(source){
                return source.getCurrentPosition.apply(source, arguments);
            });
        },

        /**
         *
         * @return {unresolved}
         */
        watchPosition: function () {
            return this.getSource().then(function(source){
                return (this.watcher = source.watchPosition.apply(source, arguments));
            });
        },

        /**
         *
         * @return {unresolved}
         */
        clearWatch: function () {
            if (this.watcher) {
                return this.watcher.clearWatch();
            }
        },
    };

    return gps;
})

