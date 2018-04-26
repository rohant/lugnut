angular.module('app.controllers')

.controller('RouteAdvancedSearchCtrl', function ($scope, $state, $log, $ionicLoading, Route, AuthService, Geolocation, Marker) {
    
    // todo:
    Geolocation.simulationEnabled(true);
    
    var tracewaypoints = new google.maps.Polyline({
        //map: $scope.map,
        path: [],
        strokeColor: "blue",
        strokeOpacity: 1.0,
        //strokeOpacity: 0.5,
        strokeWeight: 5
    });
    
    /**
     * 
     * @return {unresolved}
     */
    function getCurrentPosition(){
        
        $scope.loading = $ionicLoading.show({
            content: 'Getting current location...',
            showBackdrop: false
        });

        return Geolocation.getCurrentPosition({
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
            
            $scope.$A.pristine = false;
            $scope.$A.setPosition(myLatlng);
            $scope.$B.setPosition(myLatlng);

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
    
    /**
     * 
     * @return {undefined}
     */
    function drawDirection() {

        //$scope.loading = $ionicLoading.show({
        //    content: 'Wait..',
        //    showBackdrop: false
        //});
        
        if ($scope.isCriteriaCompleate())
        {
            var service = new google.maps.DirectionsService();
            
            service.route({
                origin: $scope.$A.getPosition(),
                destination: $scope.$B.getPosition(),
                travelMode: google.maps.DirectionsTravelMode.DRIVING
            }, function (result, status) {

                if (status == google.maps.DirectionsStatus.OK) {

                    $log.info('DirectionsStatus.OK');

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
            
            //if(!$scope.$$phase) {
            //  $scope.$apply();
            //}
        }
    }
    
    /**
     * 
     * @param {Object} point
     * @return {undefined}
     */
    $scope.active = function(current){

        //$scope.$A.setMap(null);
        //$scope.$B.setMap(null);
        //current.setMap($scope.map);

        //current.setAnimation(google.maps.Animation.DROP);
        //current.setAnimation(google.maps.Animation.BOUNCE);

        $scope.$A.setDraggable(false);
        $scope.$B.setDraggable(false);
        current.setDraggable(true);

        $scope.$A.setZIndex(0);
        $scope.$B.setZIndex(0);
        current.setZIndex(1);

        $scope.current = current;
    }
    
    /**
     * 
     * @return {Boolean}
     */
    $scope.isCriteriaCompleate = function(){
        
        
        var dirty = (!$scope.$A.pristine && !$scope.$B.pristine);

        if (dirty) {
            try {
                var distance = getDistance(
                    $scope.$A.getPosition(), 
                    $scope.$B.getPosition()
                );
                return (distance > 10);
            } catch (e) {
                //console.log(e); 
            }
        } 

        return dirty;
    }

    
    /**
     *
     * @param {type} map
     * @return {undefined}
     */
    $scope.init = function (map) {
        $scope.map = map;
        $scope.map.setZoom(15);
        $scope.showReloadBtn = false;
        $scope.initialized = true;
        
        Marker.init(map);
        tracewaypoints.setMap(map);

        $scope.$A = Marker.createMarker('Point A');
        $scope.$B = Marker.createMarker('Point B');
        
        $scope.$A.pristine = true;
        $scope.$B.pristine = true;
        
        //$scope.$A.setLabel('A');
        //$scope.$B.setLabel('B');
        
        $scope.$A.setAnimation(google.maps.Animation.DROP);
        $scope.$B.setAnimation(google.maps.Animation.DROP);
        
        //markerA.setDraggable(true);
        //markerB.setDraggable(true);
        
        $scope.$A.setZIndex(1);
        $scope.$B.setZIndex(0);
        
        //var image = {
        //    url: image,
        //    //size: new google.maps.Size(71, 71),
        //    //origin: new google.maps.Point(0, 0),
        //    //anchor: new google.maps.Point(17, 34),
        //    scaledSize: new google.maps.Size(25, 50)
        //};
        
        $scope.$A.setIcon('./img/markers/blue_MarkerA.png');
        $scope.$B.setIcon('./img/markers/red_MarkerB.png');

        google.maps.event.addListener(tracewaypoints, 'click', function () {
            console.log('click on track');
            //tracewaypoints.setOptions({strokeOpacity: 1.0});
        });
        
        google.maps.event.addListener($scope.$A, 'dragend', function(e) {
            console.log('dragend', e, [e.latLng.lat(),e.latLng.lng()]);
            $scope.$A.pristine = false;
            $scope.$A.setPosition(e.latLng);
            drawDirection();
        });
        
        google.maps.event.addListener($scope.$B, 'dragend', function(e) {
            console.log('dragend', e, [e.latLng.lat(),e.latLng.lng()]);
            $scope.$B.pristine = false;
            $scope.$B.setPosition(e.latLng);
            drawDirection();
        });
        
        google.maps.event.addListener(map, 'click', function(e) {
            console.log('click', e);
            $scope.current.pristine = false;
            $scope.current.setPosition(e.latLng);
            //tracewaypoints.setOptions({strokeOpacity: 0.5});
            drawDirection();
        });
        
        $scope.active($scope.$B);
        getCurrentPosition();
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
    
    
    $scope.search = function(){
        $scope.processing = true;
        
        var latLngA = $scope.$A.getPosition(); 
        var latLngB = $scope.$B.getPosition();
        
        $scope.criteria = {
            detour: {
                A: [
                    latLngA.lat(),
                    latLngA.lng(),
                ],
                B: [
                    latLngB.lat(),
                    latLngB.lng(),
                ]
            },
        }
        
        return Route.findAll($scope.criteria).then(function(items){
            $scope.processing = false;
            $scope.routes = items;
        });
    }
});