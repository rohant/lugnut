angular.module('app.directives', [])

.directive('map', function () {
    return {
        restrict: 'E',
        scope: {
            onCreate: '&'
        },
        link: function ($scope, $element, $attr) {
            function initialize() {
                var mapOptions = {
                    zoom: 12,
                    streetViewControl: true,
                    enableHighAccuracy: true,
                    center: new google.maps.LatLng(37.804165, -122.271213),
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                };
                var map = new google.maps.Map($element[0], mapOptions);

                $scope.onCreate({map: map});

                // Stop the side bar from dragging when mousedown/tapdown on the map
                google.maps.event.addDomListener($element[0], 'mousedown', function (e) {
                    e.preventDefault();
                    return false;
                });
            }

            if (document.readyState === "complete") {
                initialize();
            } else {
                google.maps.event.addDomListener(window, 'load', initialize);
            }
        }
    }
})

.directive('itemFloatingLabel', function() {
  return {
    restrict: 'C',
    link: function(scope, element) {
      var el = element[0];
      var input = el.querySelector('input, textarea');
      var inputLabel = el.querySelector('.input-label');

      if ( !input || !inputLabel ) return;

      var onInput = function() {
        if ( input.value ) {
          inputLabel.classList.add('has-input');
        } else {
          inputLabel.classList.remove('has-input');
        }
      };

      input.addEventListener('input', onInput);

      var ngModelCtrl = angular.element(input).controller('ngModel');
      if ( ngModelCtrl ) {
        ngModelCtrl.$render = function() {
          input.value = ngModelCtrl.$viewValue || '';
          onInput();
        };
      }

      scope.$on('$destroy', function() {
        input.removeEventListener('input', onInput);
      });
    }
  };
})

/**
 * 
 * <load-script id="'script-1'" src="'script-url.js'" on-loaded="callback($el)"></load-script>
 */
.directive('loadScript', function() {
  return {
    restrict: 'E',
    //transclude: true,
    //replace: true,
    scope: {
        id: '=',
        src: '=',
        onLoaded: '&',
        onError: '&'
    },
    //template: '&nbsp;<ng-transclude></ng-transclude>',
    link: function($scope, $el, attrs) {
        
        function initialize() {
            if (document.getElementById($scope.id)) {
                $scope.onLoaded({$el:$el});
            } else {
                var fjs = document.getElementsByTagName('script')[0];
                var js = document.createElement('script'); 
                js.id = $scope.id;
                js.src = $scope.src;
                js.onload = function(){
                    $scope.onLoaded({$el:$el});
                };
                js.onerror = function(){
                    $scope.onError({$el:$el});
                };
                fjs.parentNode.insertBefore(js, fjs);
            }
        }
        
        if (document.readyState === "complete") {
            initialize();
        }
    }
  }
})


.directive('loadGoogleMap', function(Config, $cordovaNetwork) {
  return {
    restrict: 'E',
    transclude: true,
    replace: false,
    scope: {
        onLoaded: '&',
    },
    template: [
        '<load-script id="id" src="src" on-loaded="onLoadedCallback()" on-error="onErrorCallback()"></load-script>',
        //'<ng-transclude></ng-transclude>',
    ].join(' '),
    controller: function($scope, $element, $attrs, $transclude/*, other..*/){
        $scope.id = 'google-map';
        
        // to get apiKey from server..
        //var apiKey = 'AIzaSyDBbNcRgAaE9L4Q6IuAFchPqT1BA61kHvw';
        var apiKey = Config.API_KEY;
        $scope.src = 'https://maps.googleapis.com/maps/api/js?libraries=geometry&key=' + apiKey;
        
        $scope.onErrorCallback = function(){
            console.log('Google Map is fail!');
            
            //var timer = setInterval(function(){
            //    if (typeof Connection != 'undefined') {
            //        if ($cordovaNetwork.isOnline()) {
            //            $.getJSON($scope.src, function(data) {
            //                clearInterval(timer);
            //            });
            //        }
            //    }
            //},1000);
        }
        
        $scope.onLoadedCallback = function(){
            console.log('Google Map is loaded!');
            $element.append($transclude());
            $scope.onLoaded({$el:$element});
        };
    },
    link: function($scope, $el, attrs, ctrl, transclude) {
        // do something
    }
  }
})

.directive('debugToolbar', function(Config, $timeout) {
  return {
    restrict: 'E',
    template: [
        '<div id="console" ng-show="debug.enabled">',
            '<div ng-repeat="(i, item) in logs track by $index" class="log-item">',
                '<div>',
                    '<span ng-class="cssClass(item.type)" ng-if="isString(item.message)">{{item.message}}</span>',
                    '<pre ng-class="cssClass(item.type)" ng-if="isObject(item.message)">{{item.message| json}}</pre>',
                '</div>',
            '</div>',
            '<a href="javascript:void()" class="button button-block button-stable" ng-if="showReloadBtn" ng-click="init()">',
                'Reset',
            '</a>',
        '</div>',
    ].join(' '),
    
    controller: function($scope, $element, $attrs, Logging, $timeout){

        var scroller = $element.find('#console')[0];
        
        $scope.debug = Config.debug;
        $scope.logs = Logging.logs;
        
        $scope.$on('log:updated', function (event, data) {
            $scope.logs = data.logs;

            $timeout(function() {
                //var scroller = document.getElementById("console");
                scroller.scrollTop = scroller.scrollHeight;
            }, 0, false);
            
            //if(!$scope.$$phase) {
            //  $scope.$apply();
            //}
        });

        $scope.cssClass = function (type) {
            var classList = {
                debug: '',
                error: 'assertive',
                warn: 'energized',
                info: 'positive',
            }
            return classList[type] || '';
        };
        
    },
    link: function($scope, $el, attrs, ctrl, transclude) {
        // do something
    }
  }
})


.directive('rating', function () {
    return {
        restrict: 'E',
        scope: {
            score: '<'
        },
        template: [
            '<ul>',
                '<li ng-class="{\'highlight\': score == 1}">★</li>',
                '<li ng-class="{\'highlight\': score == 2}">★</li>',
                '<li ng-class="{\'highlight\': score == 3}">★</li>',
                '<li ng-class="{\'highlight\': score == 4}">★</li>',
                '<li ng-class="{\'highlight\': score == 5}">★</li>',
            '</ul>',
        ].join(' '),
        
        link: function ($scope, $element, $attr) {

        }
    }
})
