var app = angular.module('app', [
    'ionic',
    'ngCordova',
    'app.config',
    'app.services',
    'app.controllers',
    'app.directives'
])

.run(function($rootScope, $ionicPlatform, $state, $cordovaNetwork, $ionicPopup) {

  $ionicPlatform.ready(function() {

    if(window.StatusBar) {
      StatusBar.styleDefault();
    }

    ['isArray', 'isDate', 'isDefined', 'isFunction', 'isNumber', 'isObject', 'isString', 'isUndefined'].forEach(function(name) {
        $rootScope[name] = angular[name];
    });

    //
    // Handle the deep links
    //
    // adb shell am start -W -a android.intent.action.VIEW
    // -d "http://lugnut.rmasyahin-wd.office.webdevs.us/route/20" com.wdevs.lugnut
    //
    if (typeof universalLinks != 'undefined') {
        universalLinks.subscribe('openRouteDetailedPage', function (eventData) {
            var routeId = +eventData.url.replace(/.*\//,'');
            console.log('Did launch application from the link: ' + eventData.url);
            $state.go('app.route-detail', {id: routeId});
        });
    }

    // TODO:
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams, error) {
        
        // TODO: 
        if ([
            'app.account',
            'app.dashboard',
            'app.route-list',
            'app.route-record',
            'app.route-create',
            'app.route-search',
            'app.route-search-advanced',
            
        ].indexOf(toState.name) !== -1) {
            
            if (!AuthService.isLoggedIn()) {
                event.preventDefault();
                
                // set "to back" function
                AuthService.toBack = function(){
                    AuthService.toBack = null;
                    $state.go(toState.name);
                }

                $state.go('app.signin', {}, {notify: false}).then(function() {
                    $rootScope.$broadcast('$stateChangeSuccess', toState, toParams, fromState, fromParams);
                });
            }
        }
    });
    
    
    try {
        if ($cordovaNetwork.isOffline()) {
            var appStarted = false;

            $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams, error) {
                if (!appStarted) {
                    appStarted = true;
                    event.preventDefault();
                    $state.go('app.error-no-internet')
                }
            });
        }
    } catch (e) {
        // ignore
    }

  });
})

.config(function($stateProvider, $urlRouterProvider) {
    $stateProvider

    .state('app', {
      url: '/app',
      abstract: true,
      templateUrl: 'templates/menu.html',
      controller: 'AppCtrl'
    })

    .state('app.error-no-internet', {
      url: '/error/no-internet',
      views: {
        'menuContent': {
          templateUrl: 'templates/error-no-internet.html',
          controller: 'ErrorNoInternet'
        }
      }
    })

    .state('app.dashboard', {
      url: '/dashboard',
      views: {
        'menuContent': {
          templateUrl: 'templates/dashboard.html',
          controller: 'DashboardCtrl'
        }
      }
    })

    .state('app.account', {
      url: '/account',
      views: {
        'menuContent': {
          templateUrl: 'templates/account.html',
          controller: 'AccountCtrl'
        }
      }
    })

    .state('app.signin', {
      url: '/signin',
      views: {
        'menuContent': {
          templateUrl: 'templates/signin.html',
          controller: 'SignInCtrl'
        }
      }
    })

    .state('app.signup', {
      url: '/signup',
      views: {
        'menuContent': {
          templateUrl: 'templates/signup.html',
          controller: 'SignUpCtrl'
        }
      }
    })

    .state('app.route-record', {
      url: '/route/record',
      views: {
        'menuContent': {
          templateUrl: 'templates/route-record.html',
          controller: 'RouteRecordCtrl'
        }
      }
    })

    .state('app.route-list', {
      url: '/route/list',
      views: {
        'menuContent': {
          templateUrl: 'templates/route-list.html',
          controller: 'RouteListCtrl'
        }
      }
    })

    .state('app.route-search', {
      url: '/route/search',
      views: {
        'menuContent': {
          templateUrl: 'templates/route-search.html',
          controller: 'RouteSearchCtrl'
        }
      }
    })

    .state('app.route-search-advanced', {
      url: '/route/search-advanced',
      views: {
        'menuContent': {
          templateUrl: 'templates/route-search-advanced.html',
          controller: 'RouteAdvancedSearchCtrl'
        }
      }
    })

    .state('app.route-detail', {
      url: '/route/detail/:id',
      views: {
        'menuContent': {
          templateUrl: 'templates/route-detail.html',
          controller: 'RouteDetailCtrl'
        }
      }
    })

    .state('app.route-view', {
      url: '/route/view/:id',
      views: {
        'menuContent': {
          templateUrl: 'templates/route-view.html',
          controller: 'RouteViewCtrl'
        }
      }
    })

    .state('app.route-create', {
      url: '/route/create',
      views: {
        'menuContent': {
          templateUrl: 'templates/route-create.html',
          controller: 'RouteCreateCtrl'
        }
      }
    });

    // if none of the above states are matched, use this as the fallback
    //$urlRouterProvider.otherwise('/app/route/record');
    $urlRouterProvider.otherwise(function ($injector) {
        var $state = $injector.get('$state');
        // $state.go('app.route-record');
        $state.go('app.signin');
    });
});
