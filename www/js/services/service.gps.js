angular.module('app.services')

.factory('Gps', function ($injector, $interval, $timeout, $log, $q, Config) {
    var $gl = $injector.get('$cordovaGeolocation');

    function GeoSimulator (delay, points) {
        var $s = {
            watcher: null,

            then: function(onSuccess, onError, onUpdate) {
                var i = 0;

                this.watcher = setInterval(function(){
                    if (i > points.length-1) {
                        clearInterval($s.watcher);
                        $log.debug('end.');
                    } else {
                        $log.debug('simulated position.', points[i]);

                        onUpdate({
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

            catch: function() {
                // do something
            },

            finally: function() {
                // do something
            },

            clearWatch: function() {
                return clearInterval(this.watcher)
                //return $interval.clear(this.watcher);
            },
        };

        return $s;
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
                            latitude: 37.804165,
                            longitude: -122.271213,
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
        watchPosition: function (onSuccess, onError, onUpdate) {

            if (!this.simulation) {
                return (this.watcher = $gl.watchPosition.apply(this, arguments));
            } else {
                return (this.watcher = new GeoSimulator (1000, Config.simulate.points));
            }
        },
        /**
         *
         * @return {unresolved}
         */
        clearWatch: function () {
            if (this.watcher) {
                return this.watcher.clearWatch();
            }
            //return $gl.clearWatch.apply(this, arguments);
        },

        simulation: false,
    };

    return service;
})