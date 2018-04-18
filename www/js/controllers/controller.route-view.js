angular.module('app.controllers')

.controller('RouteViewCtrl', function ($scope, $state, $log, $ionicLoading, $http, Route, Marker) {

    $scope.mapCreated = function(map){
        $scope.map = map;
        $scope.map.setZoom(15);
        Marker.init(map);
        
        var bounds  = new google.maps.LatLngBounds();
        var polylines = [];
        var path = [];
        
        $scope.loading = $ionicLoading.show({
            template: 'Logging in...'
        });

        Route.findOne($state.params.id).then(function (model) {
            
            try {
                $scope.loading.hide();
            } catch (e) {
                $ionicLoading.hide();
            }
            
            $scope.model = model;
            var chunked = $scope.model.getLatLngPoints().chunk(100);
            
            chunked.forEach(function(points, i){

                if (i-1 >= 0) {
                    points.unshift(chunked[i-1][chunked[i-1].length-1]);
                }

                var waypoints = points.map(function(point){
                    return [point.lat(), point.lng()].join(',')
                });

                if (waypoints.length) {
                    $http.get("https://roads.googleapis.com/v1/snapToRoads?interpolate=true&key="+$scope.$config.API_KEY+"&path="+waypoints.join('|'))
                    .then(function (response) {
                        $log.debug('snapToRoads:success', response)

                        var tmp = [];
                        for (var i in response.data.snappedPoints) {
                            var point = response.data.snappedPoints[i];
                            
                            var pointLatLng = new google.maps.LatLng(
                                point.location.latitude,
                                point.location.longitude
                            );
                    
                            tmp.push(pointLatLng);
                            bounds.extend(pointLatLng);
                        }

                        var tracewaypoints = new google.maps.Polyline({
                            map: $scope.map,
                            strokeColor: "blue",
                            strokeOpacity: 1.0,
                            strokeWeight: 2
                        });

                        path = path.concat(tmp);
                        tracewaypoints.setPath(tmp);
                        
                        $scope.map.fitBounds(bounds);      // auto-zoom
                        $scope.map.panToBounds(bounds);    // auto-center
                        
                        //$scope.map.setCenter(tmp[tmp.length-1]);
                        //$scope.map.setCenter(tmp[Math.ceil(tmp.length/2)]);

                        Marker
                        .createMarker('You are here!', tmp[tmp.length-1])
                        .setPosition(tmp[tmp.length-1]);

                    }, function(response) {
                        $log.error('snapToRoads:error', response)
                    });
                }
            });
        });
    }
});
