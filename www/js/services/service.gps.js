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
                    i = 0;
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

.factory('Geolocation', function ($q, $log, $injector) {

    var gps = {

        simulation: false,
        simulator: null,
        geolocation: null,

        /**
         * Returns the simulation status.
         * If exists the "enabled" argument then will be set status to the current value.
         *
         * @param {Boolean} enable optional
         * @return {Boolean}
         */
        simulationEnabled: function(enable) {
            if (!angular.isUndefined(enable)) {
                this.simulation = enable;
            }
            return this.simulation;
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
            this.simulator.$parrent = this;
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
            var args = arguments;
            return this.getSource().then(function(source){
                return source.getCurrentPosition.apply(source, args);
            });
        },
        /**
         *
         * @return {unresolved}
         */
        watchPosition: function () {
            var args = arguments;
            return this.getSource().then(function(source){
                return (gps.watcher = source.watchPosition.apply(source, args));
                //return source.watchPosition.apply(source, args);
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

    if (ionic.Platform.is('browser') || !ionic.Platform.isAndroid()) {
      // based on the W3C Geolocation API Specification.
      var $cordovaGeolocation = $injector.get('$cordovaGeolocation');
    } else {
      // uses the Google Play services location APIs.
      var $cordovaGeolocation = $injector.get('$cordovaGeolocationAdvanced');
    }

    var GeolocationSimulator = $injector.get('GeolocationSimulator');

    gps.setGeolocation($cordovaGeolocation);
    gps.setGeolocationSimulator(GeolocationSimulator);

    // TODO: it must be refactored
    var cfg = JSON.parse(localStorage.getItem('debug'));
    if (cfg) {
        gps.simulationEnabled(cfg.enabled);
    }

    return gps;
})

/**
 * This Cordova plugin provides information about the device's location,
 * such as latitude and longitude and uses the Google Play services location APIs.
 *
 * Based on: https://github.com/louisbl/cordova-plugin-locationservices
 */
.factory('$cordovaGeolocationAdvanced', ['$q', function ($q) {

  if (typeof cordova === 'undefined') return {};

  var geolocation = cordova.plugins.locationServices.geolocation;

  var PRIORITY_HIGH_ACCURACY = 100;
  var PRIORITY_BALANCED_POWER_ACCURACY = 102;
  var PRIORITY_LOW_POWER = 104;
  var PRIORITY_NO_POWER = 105;

  var priorities = {
    PRIORITY_HIGH_ACCURACY: PRIORITY_HIGH_ACCURACY,
    PRIORITY_BALANCED_POWER_ACCURACY: PRIORITY_BALANCED_POWER_ACCURACY,
    PRIORITY_LOW_POWER: PRIORITY_LOW_POWER,
    PRIORITY_NO_POWER: PRIORITY_NO_POWER
  };

  function prepare(options) {
    if (!options) {
      options = {};
    }
    if (!options.timeout) {
      options.timeout = 30000;
    }
    if (!options.priority) {
      options.priority = PRIORITY_HIGH_ACCURACY;
    }
    if (!options.maximumAge) {
      options.maximumAge = 10000;
    }
    if (!options.interval) {
      options.interval = 1000;
    }
    if (!options.fastInterval) {
      options.fastInterval = 1000;
    }
    return options;
  }

  return {
    priorities: priorities,

    // geolocationOptions = {
    //   maximumAge: 3000,
    //   timeout: 5000,
    //   enableHighAccuracy: true,
    //   priority: PRIORITY_HIGH_ACCURACY,
    //   interval: 6000,
    //   fastInterval: 1000
    // };
    getCurrentPosition: function (options) {
      var q = $q.defer();
      options = prepare(options);
      
      console.log('use Google geolocation services.', options);
      console.log('geolocationOptions', options);

      geolocation.getCurrentPosition(function (result) {
        q.resolve(result);
      }, function (err) {
        q.reject(err);
      }, options);

      return q.promise;
    },

    watchPosition: function (options) {
      var q = $q.defer();
      options = prepare(options);
      
      console.log('use Google geolocation services.', options);
      console.log('geolocationOptions', options);

      var watchID = geolocation.watchPosition(function (result) {
        q.notify(result);
      }, function (err) {
        q.reject(err);
      }, options);

      q.promise.cancel = function () {
        geolocation.clearWatch(watchID);
      };

      q.promise.clearWatch = function (id) {
        geolocation.clearWatch(id || watchID);
      };

      q.promise.watchID = watchID;

      return q.promise;
    },

    clearWatch: function (watchID) {
      return geolocation.clearWatch(watchID);
    }
  };
}]);
