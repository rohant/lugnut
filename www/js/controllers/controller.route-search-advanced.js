angular.module('app.controllers')

.controller('RouteAdvancedSearchCtrl', function ($scope, $state, $log, $ionicLoading, Route, AuthService, Geolocation, Marker) {
    
    // todo:
    Geolocation.simulationEnabled(true);
    
    var point = {
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
        
        markerA.setDraggable(true);
        markerB.setDraggable(true);
        
        markerA.setZIndex(1);
        markerB.setZIndex(0);
        
//        var image = {
//            url: image,
//            //size: new google.maps.Size(71, 71),
//            //origin: new google.maps.Point(0, 0),
//            //anchor: new google.maps.Point(17, 34),
//            scaledSize: new google.maps.Size(25, 50)
//        };
        
        markerA.setIcon('./img/markers/blue_MarkerA.png');
        markerB.setIcon('./img/markers/red_MarkerB.png');
    
        $scope.pointA = angular.extend({}, point, {
            name: 'Point A',
            marker: markerA,
        });

        $scope.pointB = angular.extend({}, point, {
            name: 'Point B',
            marker: markerB,
        });

        /**
         * 
         * @param {Object} point
         * @return {undefined}
         */
        $scope.active = function(point){
            //$scope.pointA.marker.setMap(null);
            //$scope.pointB.marker.setMap(null);
            //point.marker.setMap($scope.map);
            
            //point.marker.setAnimation(google.maps.Animation.DROP);
            //point.marker.setAnimation(google.maps.Animation.BOUNCE);
            
            $scope.pointA.marker.setZIndex(0);
            $scope.pointB.marker.setZIndex(0);
            point.marker.setZIndex(1);
            
            $scope.current = point;
        }

        $scope.setPoint = function(){
            //$scope.current.setPosition(myLatlng);
        }

        $scope.active($scope.pointA);
        
        google.maps.event.addListener($scope.current.marker, 'dragend', function(e) {
            console.log('dragend', e)
            var point = e.latLng;
            map.setCenter(point);
        });
        
        google.maps.event.addListener(map, 'click', function(e) {
            console.log('click', e)
            $scope.current.marker.setPosition(e.latLng);
        });
        
        
        console.log('pointA', $scope.pointA);
        console.log('pointB', $scope.pointB);
        
        

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