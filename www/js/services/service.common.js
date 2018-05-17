angular.module('app.services', [])


.config(['$provide', function ($provide) {
    $provide.decorator('$log', ['$delegate', 'Logging', function ($delegate, Logging) {
        Logging.enabled = true;
        
        var methods = {
            debug: function () {
                $delegate.debug.apply($delegate, arguments);
                Logging.debug.apply(null, arguments);
            },
            error: function () {
                $delegate.error.apply($delegate, arguments);
                Logging.error.apply(null, arguments);
            },
            info: function () {
                $delegate.info.apply($delegate, arguments);
                Logging.info.apply(null, arguments);
            },
            warn: function () {
                $delegate.warn.apply($delegate, arguments);
                Logging.warn.apply(null, arguments);
            }
        };
        return methods;
    }]);
}])

.service('Logging', function ($injector) {
    
    var log = function (type) {
        return function(){
            var data = arguments;
            
            for (var i in data) {
                service.logs.push({
                    type: type,
                    time: (new Date()).getTime(),
                    message: angular.isObject(data[i]) ? angular.copy(data[i]) : data[i],
                });
            }
            
            var $rs = $injector.get('$rootScope');
            $rs.$broadcast('log:updated', {
                logs: service.logs
            });
        }
    }
    
    var service = {
        debug: function () {
            log('debug').apply(this, arguments);
        },
        error: function () {
            log('error').apply(this, arguments);
        },
        warn: function () {
            log('warn').apply(this, arguments);
        },
        info: function () {
            log('info').apply(this, arguments);
        },
        enabled: false,
        logs: []
    };

    return service;
})

.service('GoogleStaticMap', function (Config) {
    
    var service = {
        
        /**
         * https://developers.google.com/maps/documentation/static-maps/intro#location
         * 
         * @param {Object} options
         * @return {String}
         */
        makeImg: function(options){
            
            if (!options) options = {};
            
            options['key'] = Config.API_KEY;
            
            if (!options['size'])
                options['size'] = '500x400';
            
            if (!options['scale'])
                options['scale'] = 1;
            
            if (!options['format'])
                options['format'] = 'JPEG';
            
            if (!options['maptype'])
                options['maptype'] = 'roadmap';
                
            if (options['path']) {
                if (angular.isArray(options['path'])) {
                    options['path'] = options['path'].join('|');
                }
            }
            
            var markers = '';
            if (options['markers']) {
                if (angular.isArray(options['markers'])) {
                    for (var i in options['markers']) {
                        options['markers'][i] = 'markers='+options['markers'][i];
                    }
                    //options['markers'] = options['markers'].join('&');
                    markers = '&' + options['markers'].join('&');
                }
            }
            if (!options['path'] && !options['markers'])
            {
                if (!options['center'])
                    options['center'] = '';

                if (!options['zoom'])
                    options['zoom'] = 10;
            }
            
            //options['language'] = '';
            
            return 'https://maps.googleapis.com/maps/api/staticmap?' + $.param(options) + markers;
        }
    };

    return service;
});