angular.module('app.controllers')

.controller('RouteViewCtrl', function ($scope, $state, $log, $http, Route, Marker) {
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

            var waypoints = $scope.model.getLatLngPoints().map(function(point){
                return [point.lat(), point.lng()].join(',')
            });

            if (waypoints.length) {
                $http.get("https://roads.googleapis.com/v1/snapToRoads?interpolate=true&key="+$scope.$config.API_KEY+"&path="+waypoints.join('|'))
                .then(function (response) {
                    $log.debug('snapToRoads:success', response)

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
                    $log.error('snapToRoads:error', response)
                });
            }
        });
    }
});
