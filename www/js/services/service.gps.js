angular.module('app.services')

.factory('Gps', function ($injector, $interval, $timeout, $log, $q, Config) {
    var $gl = $injector.get('$cordovaGeolocation');

    var simulator = {
        
        fakeID: 0,
        
        getFakeRoutes: function(){
            return Config.simulate.fakeRoutes;
        },
        getFakeRoute: function(id){
            return this.getFakeRoutes()[id];
        },

        /**
         *
         * @return {unresolved}
         */
        getCurrentPosition: function () {
            var route = this.getFakeRoute(this.fakeID);

            return $timeout(function(){}, route.interval).then(function() {
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
    }

    var gps = {
        
        simulation: false,
        simulator: simulator,
        
        /**
         * 
         * @return {simulator|$cordovaGeolocation}
         */
        getSource: function(){
            return !this.simulation ? $gl : this.simulator;
        },
        
        /**
         *
         * @return {unresolved}
         */
        getCurrentPosition: function () {//debugger;
            var source = this.getSource();
            return source.getCurrentPosition.apply(source, arguments);
        },
        
        /**
         *
         * @return {unresolved}
         */
        watchPosition: function () {
            var source = this.getSource();
            return (this.watcher = source.watchPosition.apply(source, arguments));
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