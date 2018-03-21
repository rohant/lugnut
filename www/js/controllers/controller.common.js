angular.module('app.controllers', [])

.controller('AppCtrl', function ($scope, $log, $state, Config) {
    $scope.$config = Config;
    $scope.$state = $state;
    $scope.debug = Config.debug;

    $log.info('Start application!');
})

.controller('LogCtrl', function ($scope, $timeout, Logging) {
    $scope.logs = Logging.logs;

    $scope.$on('log:updated', function (event, data) {
        $scope.logs = data.logs;

        if(!$scope.$$phase) {
          $scope.$apply();
        }

        $timeout(function() {
          var scroller = document.getElementById("console");
          scroller.scrollTop = scroller.scrollHeight;
        }, 0, false);
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
})

.controller('RouteListCtrl', function ($scope, $state, Route) {
    Route.findAll().then(function(items){
        $scope.routes = items;

        //if (!items.langth) {
        //    $state.go('app.map')
        //}
    })
})

.controller('RouteViewCtrl', function ($scope, $state, $http, Route, Marker) {
    var tracewaypoints;

    $scope.mapCreated = function(map){
        $scope.map = map;
        $scope.map.setZoom(15);
        
        Marker.init(map);

        Route.findOne($state.params.id).then(function(model){
            $scope.model = model;

            if (!tracewaypoints) {
                tracewaypoints = new google.maps.Polyline({
                    map: $scope.map,
                    strokeColor: "blue",
                    strokeOpacity: 1.0,
                    strokeWeight: 2
                });
            }

            var waypoints = [];
            for (var i in $scope.model.points) {
                waypoints.push(Object.keys($scope.model.points[i]).map(function(it) {
                    return $scope.model.points[i][it]
                }).join(','));
            }

            if (waypoints.length) {
                $http.get("https://roads.googleapis.com/v1/snapToRoads?interpolate=true&key="+$scope.$config.API_KEY+"&path="+waypoints.join('|'))
                .then(function (response) {
                    console.log('snapToRoads:success', response)

                    var tmp = [];
                    for (var i in response.data.snappedPoints) {
                        var point = response.data.snappedPoints[i];
                        tmp.push(new google.maps.LatLng(
                            point.location.latitude,
                            point.location.longitude
                        ));
                        tracewaypoints.setPath(tmp);
                    }

                    $scope.map.setCenter(tmp[tmp.length-1]);
                    //$scope.map.setCenter(tmp[Math.ceil(tmp.length/2)]);

                    Marker
                    .createMarker('You are here!', tmp[tmp.length-1])
                    .setPosition(tmp[tmp.length-1]);

                }, function(response) {
                    console.log('snapToRoads:error', response)
                });
            }
        });
    }
});
