var app = angular.module('app', [
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

    .state('app.search', {
      url: '/route/search',
      views: {
        'menuContent': {
          templateUrl: 'templates/route-search.html',
          controller: 'RouteSearchCtrl'
        }
      }
    })

    .state('app.search-advanced', {
      url: '/route/search-advanced',
      views: {
        'menuContent': {
          templateUrl: 'templates/route-search-advanced.html',
          controller: 'RouteAdvancedSearchCtrl'
        }
      }
    })

    .state('app.view', {
      url: '/route/view/:id',
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
