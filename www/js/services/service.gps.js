angular.module('app.services')

.provider('FakeRoutes', function() {
    
    var routes = [], current = null;
    
    /**
     * 
     * @param {Object} data
     * @return {FakeRoute}
     */
    function FakeRoute (data) {
        this.active = false;
        this.id = routes.length;
        angular.extend(this, data);
    }
    /**
     * 
     * @return {FakeRoute}
     */
    FakeRoute.prototype.apply = function () {
        
        for (var i in routes) 
            routes[i].active = false;
        
        this.active = true;
        current = this;
        
        return this;
    }
    
    return {
        
        addRoute: function (route) {
            routes.push(new FakeRoute(route));
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
                getActiveRoute: function(){

                    if (!current) 
                    {
                        for (var i in routes) {
                            if (routes[i].active) {
                                current = routes[i];
                                break;
                            }
                        }

                        if (!current) {
                            current = routes[0];
                        }
                    }
                    
                    return current;
                },
            };
        }
    };
})

.factory('GeolocationSimulator', function ($q, $log, $timeout, FakeRoutes) {
    
    var simulator = {
        
        fakeRoute: null,

        /**
         * 
         * @param {Object} route
         * @return {simulator}
         */
        setFakeRoute: function(route){
            this.fakeRoute = route;
            
            $log.info('Fake route: "' + route.name + '"');
            
            return this;
        },
        
        /**
         * 
         * @return {Object}
         */
        getFakeRoute: function(){
            
            //return FakeRoutes.getActiveRoute();
            
            if (!this.fakeRoute)
                throw new Error("Fake route is wrong!");
            
            return this.fakeRoute;
        },

        /**
         *
         * @return {unresolved}
         */
        getCurrentPosition: function () {

            var route = this.getFakeRoute();

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
            var route = this.getFakeRoute();

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
    
    simulator.setFakeRoute(FakeRoutes.getActiveRoute());
    
    return simulator;
})

.factory('Geolocation', function ($q, $log, $cordovaGeolocation, GeolocationSimulator) {
    
    var gps = {

        simulation: false,
        simulator: null,
        geolocation: null,
        
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
         * @param {$cordovaGeolocation} geolocation
         * @return {gps}
         */
        setGeolocation: function (geolocation) {
            this.geolocation = geolocation;
            return this;
        },
        /**
         * 
         * @return {$cordovaGeolocation}
         */
        getGeolocation: function () {
            return this.geolocation;
        },
        /**
         * 
         * @param {GeolocationSimulator} simulator
         * @return {gps}
         */
        setGeolocationSimulator: function (simulator) {
            this.simulator = simulator;
            return this;
        },
        /**
         * 
         * @return {GeolocationSimulator}
         */
        getGeolocationSimulator: function () {
            return this.simulator;
        },
        /**
         * 
         * @return {Object}
         */
        getSource: function(){
            var deferred = $q.defer();

            ionic.Platform.ready(function() {
                
                var source = gps.simulation 
                    ? gps.getGeolocationSimulator() 
                    : gps.getGeolocation();
                
                deferred.resolve(source);
            });

            return deferred.promise;
        },
        /**
         *
         * @return {unresolved}
         */
        getCurrentPosition: function () {
            var arguments = arguments;
            return this.getSource().then(function(source){
                return source.getCurrentPosition.apply(source, arguments);
            });
        },
        /**
         *
         * @return {unresolved}
         */
        watchPosition: function () {
            var arguments = arguments;
            return this.getSource().then(function(source){
                return (gps.watcher = source.watchPosition.apply(source, arguments));
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
    
    gps.setGeolocation($cordovaGeolocation);
    gps.setGeolocationSimulator(GeolocationSimulator);

    return gps;
})

