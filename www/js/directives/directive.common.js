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

///**
// * 
// * <load-script id="'script-1'" src="'script-url.js'" on-loaded="callback($el)"></load-script>
// */
//.directive('loadScript', function() {
//  return {
//    restrict: 'E',
//    //transclude: true,
//    //replace: true,
//    scope: {
//        id: '=',
//        src: '=',
//        onLoaded: '&'
//    },
//    //template: '&nbsp;<ng-transclude></ng-transclude>',
//    link: function($scope, $el, attrs) {
//        
//        if (document.getElementById($scope.id)) {
//            $scope.onLoaded({$el:$el});
//        } else {
//            var fjs = document.getElementsByTagName('script')[0];
//            var js = document.createElement('script'); 
//            js.id = $scope.id;
//            js.src = $scope.src;
//            js.onload = function(){
//                $scope.onLoaded({$el:$el});
//            };
//            fjs.parentNode.insertBefore(js, fjs);
//        }
//    }
//  }
//})
//
//
//.directive('loadGoogleMap', function(Config) {
//  return {
//    restrict: 'E',
//    transclude: true,
//    replace: false,
//    scope: {
//        onLoaded: '&'
//    },
//    template: [
//        '<load-script id="id" src="src" on-loaded="callback($el)"></load-script>',
//        //'<ng-transclude></ng-transclude>',
//    ].join(' '),
//    controller: function($scope, $element, $attrs, $transclude/*, other..*/){
//        $scope.id = 'google-map';
//        
//        // to get apiKey from server..
//        //var apiKey = 'AIzaSyDBbNcRgAaE9L4Q6IuAFchPqT1BA61kHvw';
//        var apiKey = Config.API_KEY;
//        $scope.src = 'https://maps.googleapis.com/maps/api/js?key=' + apiKey;
//        
//        $scope.callback = function(){
//            console.log('Google Map is loaded!');
//            $element.append($transclude());
//            $scope.onLoaded({$el:$element});
//        };
//        
//    },
//    link: function($scope, $el, attrs, ctrl, transclude) {
//        // do something
//    }
//  }
//});
