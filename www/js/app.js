angular.module('app', ['ionic', 'app.controllers', 'app.directives', 'app.config'])

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
  
//  .state('app.search', {
//    url: '/search',
//    views: {
//      'menuContent': {
//        templateUrl: 'templates/search.html'
//      }
//    }
//  })
//
//  .state('app.browse', {
//      url: '/browse',
//      views: {
//        'menuContent': {
//          templateUrl: 'templates/browse.html'
//        }
//      }
//    })
//    .state('app.playlists', {
//      url: '/playlists',
//      views: {
//        'menuContent': {
//          templateUrl: 'templates/playlists.html',
//          controller: 'PlaylistsCtrl'
//        }
//      }
//    })
//
//  .state('app.single', {
//    url: '/playlists/:playlistId',
//    views: {
//      'menuContent': {
//        templateUrl: 'templates/playlist.html',
//        controller: 'PlaylistCtrl'
//      }
//    }
//  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/map');
});
