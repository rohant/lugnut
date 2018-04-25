angular.module('app.controllers')

.controller('RouteAdvancedSearchCtrl', function ($scope, $state, $log, $ionicLoading, Route, AuthService, Geolocation, Marker) {
    
    // todo:
    Geolocation.simulationEnabled(true);
    
    var point = {
        pristine: true,
        latLng: null,
        marker: null,

        setPosition: function(latLng){
            this.latLng = latLng;

            if (this.marker){
                this.marker.setPosition(latLng);
            }
            
            return this;
        }
    };
        
    
    /**
     *
     * @param {type} map
     * @return {undefined}
     */
    $scope.init = function (map) {
        $scope.map = map;
        $scope.map.setZoom(15);
        $scope.showReloadBtn = false;
        
        Marker.init(map);
        
//        function createMarker() {}
        
        
        var markerA = Marker.createMarker('Point A');
        var markerB = Marker.createMarker('Point B');
        
        //markerA.setLabel('A');
        //markerB.setLabel('B');
        
        markerA.setAnimation(google.maps.Animation.DROP);
        markerB.setAnimation(google.maps.Animation.DROP);
        
        //markerA.setDraggable(true);
        //markerB.setDraggable(true);
        
        markerA.setZIndex(1);
        markerB.setZIndex(0);
        
        //var image = {
        //    url: image,
        //    //size: new google.maps.Size(71, 71),
        //    //origin: new google.maps.Point(0, 0),
        //    //anchor: new google.maps.Point(17, 34),
        //    scaledSize: new google.maps.Size(25, 50)
        //};
        
        markerA.setIcon('./img/markers/blue_MarkerA.png');
        markerB.setIcon('./img/markers/red_MarkerB.png');
    
        $scope.pointA = angular.extend(angular.copy(point), {
            name: 'Point A',
            marker: markerA,
        });

        $scope.pointB = angular.extend(angular.copy(point), {
            name: 'Point B',
            marker: markerB,
        });
        
        $scope.current = $scope.pointA;
        
        /**
         * 
         * @param {Object} point
         * @return {undefined}
         */
        $scope.active = function(current){
            
            //$scope.pointA.marker.setMap(null);
            //$scope.pointB.marker.setMap(null);
            //current.marker.setMap($scope.map);
            
            //current.marker.setAnimation(google.maps.Animation.DROP);
            //current.marker.setAnimation(google.maps.Animation.BOUNCE);
            
            $scope.pointA.marker.setDraggable(false);
            $scope.pointB.marker.setDraggable(false);
            current.marker.setDraggable(true);
            
            $scope.pointA.marker.setZIndex(0);
            $scope.pointB.marker.setZIndex(0);
            current.marker.setZIndex(1);
            
            $scope.current = current;
        }

        $scope.pointA.pristine = false;
        $scope.active($scope.pointA);
        
        var tracewaypoints = new google.maps.Polyline({
            map: $scope.map,
            path: [],
            strokeColor: "blue",
            strokeOpacity: 1.0,
            strokeWeight: 2
        });
        
        //tracewaypoints.setMap($scope.map);
        
        function drawDirection() {
            
            //$scope.loading = $ionicLoading.show({
            //    content: 'Wait..',
            //    showBackdrop: false
            //});
            
            if (!$scope.pointA.pristine && !$scope.pointB.pristine)
            {
                console.log('drawDirection()', 
                    [$scope.pointA.latLng.lat(), $scope.pointA.latLng.lng()], 
                    [$scope.pointB.latLng.lat(), $scope.pointB.latLng.lng()]);
                
                var service = new google.maps.DirectionsService();

                service.route({
                    origin: $scope.pointA.latLng,
                    destination: $scope.pointB.latLng,
                    travelMode: google.maps.DirectionsTravelMode.DRIVING
                }, function (result, status) {
                    
                    if (status == google.maps.DirectionsStatus.OK) {

                        console.log('DirectionsStatus.OK', result);
                        
                        try {
                            $scope.loading.hide();
                        } catch (e) {
                            $ionicLoading.hide();
                        }

                        var snapPath = result.routes[0].overview_path;
                        tracewaypoints.setPath(snapPath);
                    } else {
                        $log.error("Directions request failed: " + status);
                    }
                });
            }
        }
        
        google.maps.event.addListener($scope.pointA.marker, 'dragend', function(e) {
            console.log('dragend', e, [e.latLng.lat(),e.latLng.lng()]);
            $scope.pointA.pristine = false;
            $scope.pointA.setPosition(e.latLng);
            drawDirection();
        });
        
        google.maps.event.addListener($scope.pointB.marker, 'dragend', function(e) {
            console.log('dragend', e, [e.latLng.lat(),e.latLng.lng()]);
            $scope.pointB.pristine = false;
            $scope.pointB.setPosition(e.latLng);
            drawDirection();
        });
        
        google.maps.event.addListener(map, 'click', function(e) {
            console.log('click', e);
            $scope.current.pristine = false;
            $scope.current.setPosition(e.latLng);
            drawDirection();
        });
        

        $scope.loading = $ionicLoading.show({
            content: 'Getting current location...',
            showBackdrop: false
        });

        Geolocation.getCurrentPosition({
            enableHighAccuracy: true,
            maximumAge: 6000,
            timeout: 30000,
        }).then(function (position) {
            
            $log.debug('Got position:', position);
            //$scope.showActions = true;

            try {
                $scope.loading.hide();
            } catch (e) {
                $ionicLoading.hide();
            }

            var myLatlng = new google.maps.LatLng(
                position.coords.latitude,
                position.coords.longitude
            );

            $scope.map.setCenter(myLatlng);
            
            $scope.pointA.setPosition(myLatlng);
            $scope.pointB.setPosition(myLatlng);

        }, function (error) {

            $log.error('Unable to get location: ' + error.message, error);
            $scope.showReloadBtn = true;

            try {
                $scope.loading.hide();
            } catch (e) {
                $ionicLoading.hide();
            }
        });
    }
    
    
    
    
    //if (!AuthService.isLoggedIn()) {
    //
    //    // set "to back" function
    //    AuthService.toBack = function(){
    //        AuthService.toBack = null;
    //        $state.go('app.search-advanced');
    //    }
    //
    //    $state.go('app.signin');
    //}
    
    $scope.criteria = {
        query: '',
    }
    
    $scope.reload = function(){
        $scope.processing = true;
        
        return Route.findAll($scope.criteria).then(function(items){
            $scope.processing = false;
            $scope.routes = items;
        });
    }
});