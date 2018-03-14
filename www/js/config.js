angular.module('app.config', [])

.value('Config', {
    // 
})

.config(['$logProvider', function ($logProvider) {
    $logProvider.debugEnabled(true);
}])


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
            
            //if (typeof arguments !== 'object') {
            //
            //} else {
            //
            //}
            
            service.logs.push({
                type: type,
                messages: data,
                time: (new Date()).getTime(),
            });
            
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
});