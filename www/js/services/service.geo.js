angular.module('app.services')

.factory('Gps', function ($injector, $interval, $timeout, $log, $q, Config) {
    var $gl = $injector.get('$cordovaGeolocation');
    
    function simulation (delay, points) {
        return {
            watcher: null,
            
            then: function(callback) {
                var i = 0;
                
                this.watcher = setInterval(function(){
                    if (i <= points.length) {
                        $log.debug('simulated position.', points[i]);
                        
                        callback({
                            coords: {
                                accuracy: 15.720999717712402,
                                altitude: 181,
                                altitudeAccuracy: null,
                                heading: null,
                                latitude: points[i][0],
                                longitude: points[i][1],
                                speed: null
                            },
                            timestamp: new Date().getTime(),
                            simulated: true
                        });
                        i++;
                    }
                    
                }, +delay);
                
                return this.watcher;
            },
            
            catch: function(callback) {
                // do something
            },
            
            clearWatch: function() {
                return $interval.clear(this.timer);
            },
        }
    }
    
    
    var service = {
        
        /**
         * 
         * @return {unresolved}
         */
        getCurrentPosition: function () {
            
            if (!this.simulation) {
                return $gl.getCurrentPosition.apply(this, arguments);
            } else {
                return $timeout(function(){}, 3000).then(function(){
                    
                    $log.debug('simulated current position.');
                    
                    return {
                        coords: {
                            accuracy: 15.720999717712402,
                            altitude: 181,
                            altitudeAccuracy: null,
                            heading: null,
                            latitude: 49.9837886,
                            longitude: 36.1818388,
                            speed: null
                        },
                        timestamp: new Date().getTime(),
                        simulated: true
                    }
                });
            }
        },
        /**
         * 
         * @return {unresolved}
         */
        watchPosition: function () {
            
            if (!this.simulation) {
                return $gl.watchPosition.apply(this, arguments);
            } else {
                
                this.simulator = simulation (2000, Config.simulate.points);
                
                return this.simulator;
            }
        },
        /**
         * 
         * @return {unresolved}
         */
        clearWatch: function () {
            if (this.simulation) {
                clearInterval(this.simulator.watcher)
            } else {
                return $gl.clearWatch.apply(this, arguments);
            }
        },

        simulation: false
    };

    return service;
});