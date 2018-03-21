angular.module('app', [
    'ionic',
    'ngCordova',
    'app.config',
    'app.services',
    'app.controllers',
    'app.directives'
])

.run(function($rootScope, $ionicPlatform) {
  $ionicPlatform.ready(function() {

    if(window.StatusBar) {
      StatusBar.styleDefault();
    }

    ['isArray', 'isDate', 'isDefined', 'isFunction', 'isNumber', 'isObject', 'isString', 'isUndefined'].forEach(function(name) {
        $rootScope[name] = angular[name];
    });

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

    .state('app.map', {
      url: '/map',
      views: {
        'menuContent': {
          templateUrl: 'templates/map.html',
          controller: 'MapCtrl'
        }
      }
    })

    .state('app.list', {
      url: '/route/list',
      views: {
        'menuContent': {
          templateUrl: 'templates/route-list.html',
          controller: 'RouteListCtrl'
        }
      }
    })

    .state('app.view', {
      url: '/route/:id',
      views: {
        'menuContent': {
          templateUrl: 'templates/route-view.html',
          controller: 'RouteViewCtrl'
        }
      }
    })

    .state('app.create', {
      url: '/route/create',
      views: {
        'menuContent': {
          templateUrl: 'templates/route-create.html',
          controller: 'RouteCreateCtrl'
        }
      }
    });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/map');
});
