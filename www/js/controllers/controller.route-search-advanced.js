angular.module('app.controllers')

.controller('RouteAdvancedSearchCtrl', function ($scope, $state, $log, $ionicLoading, Route, AuthService, Geolocation, Marker) {

    var closedArrowIcon = {
        //path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
        //scale: 2.5,
    };

    var tracewaypoints = new google.maps.Polyline({
        //map: $scope.map,
        path: [],
        strokeColor: "blue",
        strokeOpacity: 1.0,
        //strokeOpacity: 0.5,
        strokeWeight: 5,
        zIndex: 1000,
        icons: [{
            icon: closedArrowIcon,
            offset: '100%'
        }]
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

            var myLatlng = new google.maps.LatLng(
                position.coords.latitude,
                position.coords.longitude
            );

            $scope.map.panTo(myLatlng);

            $scope.$A.pristine = false;
            $scope.$A.setPosition(myLatlng);
            $scope.$B.setPosition(myLatlng);

            $scope.currentMarker = Marker.createMarker('You here!');
            $scope.currentMarker.setIcon('./img/markers/darkgreen_MarkerA.png');
            $scope.currentMarker.setAnimation(google.maps.Animation.DROP);
            $scope.currentMarker.setPosition(myLatlng);

            google.maps.event.addListener($scope.currentMarker, 'click', function(e) {
                $scope.$A.setPosition(e.latLng);
                $scope.$A.pristine = false;
                drawDirection();
            });

        }, function (error) {

            $log.error('Unable to get location: ' + error.message, error);
            $scope.showReloadBtn = true;

        }).finally(function(){
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

        removeAlternativeRoutes();

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

                if (status != google.maps.DirectionsStatus.OK) {
                    $log.error("Directions request failed: " + status);
                } else {
                    $log.info('DirectionsStatus.OK');
                    var snapPath = result.routes[0].overview_path;
                    tracewaypoints.setPath(snapPath);
                }
            });

            if(!$scope.$$phase) {
             $scope.$apply();
            }
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

        $scope.$A.setZIndex(1);
        $scope.$B.setZIndex(1);
        current.setZIndex(2);

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
                console.log(e);
            }
        }

        return dirty;
    }

    /**
     * Initialize the Google Map
     * @param {type} map
     * @return {undefined}
     */
    $scope.mapCreated = function (map) {
        
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

        $scope.$A.setZIndex(2);
        $scope.$B.setZIndex(1);

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
            $log.debug('click on track');
            //tracewaypoints.setOptions({strokeOpacity: 1.0});
        });

        google.maps.event.addListener($scope.$A, 'dragend', function(e) {
            $log.debug('A:dragend');
            $scope.$A.pristine = false;
            $scope.$A.setPosition(e.latLng);
            drawDirection();
        });

        google.maps.event.addListener($scope.$B, 'dragend', function(e) {
            $log.debug('B:dragend');
            $scope.$B.pristine = false;
            $scope.$B.setPosition(e.latLng);
            drawDirection();
        });

        google.maps.event.addListener(map, 'click', function(e) {
            $log.debug('Map:click');
            $scope.current.pristine = false;
            $scope.current.setPosition(e.latLng);
            //tracewaypoints.setOptions({strokeOpacity: 0.5});
            drawDirection();
        });

        $scope.active($scope.$B);
        $scope.init();
    }

    /**
     *
     * @param {type} map
     * @return {undefined}
     */
    $scope.init = function (map) {
        getCurrentPosition();
    }


    if (!AuthService.isLoggedIn()) {

        // set "to back" function
        AuthService.toBack = function(){
            AuthService.toBack = null;
            $state.go('app.route-search-advanced');
        }

        $state.go('app.signin');
    }


    $scope.search = function(){
        $scope.processing = true;

        var latLngA = $scope.$A.getPosition();
        var latLngB = $scope.$B.getPosition();

        var criteria = {

            detour: {
                A: {
                    lat: latLngA.lat(),
                    lng: latLngA.lng(),
                    precision: 5,
                },
                B: {
                    lat: latLngB.lat(),
                    lng: latLngB.lng(),
                    precision: 6,
                }
            },
        }

        return Route.findAll(criteria).then(function(items){
            $scope.routes = items;
            drawAlternativeRoutes();
        }).finally(function(){
            $scope.processing = false;
        });
    }


    var polilines = [];



    function removeAlternativeRoutes () {

        for (var i in polilines) {
            polilines[i].setMap(null);
        }
        polilines = [];
    }

    function drawAlternativeRoutes ()
    {
        for (var i in $scope.routes) {

            var poliline = new google.maps.Polyline({
                map: $scope.map,
                path: $scope.routes[i].points,
                strokeColor: "grey",
                //strokeColor: getRandomColor(),
                //strokeOpacity: 1.0,
                strokeOpacity: 0.5,
                strokeWeight: 5,
                zIndex: i,
                icons: [{
                    icon: closedArrowIcon,
                    offset: '100%'
                }]
            });

            google.maps.event.addListener(poliline, 'click', function () {
                $log.debug('click on track: #' + $scope.routes[i].id + ' ' + $scope.routes[i].title);
                //poliline.setOptions({strokeOpacity: 1.0});
                $state.go('app.route-detail', {id: $scope.routes[i].id});
            });

            polilines.push(poliline);
        }
    }

    /*function getRandomColor() {
        return '#' + Math.floor(Math.random()*16777215).toString(16);
    }*/


    $scope.$on("$destroy", function () {
        console.log('$destroy')
    });

    $scope.$on("$ionicView.enter", function (event) {

        if (Geolocation.simulationEnabled()) {

            var fakeRoute = Geolocation
                .getGeolocationSimulator()
                .getFakeRoute();

            $log.info('Used the fake route: ' + fakeRoute.name);
        }
    });
});
