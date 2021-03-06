angular.module('app.controllers')

.controller('RouteViewCtrl', function (
    $injector,
    $scope,
    $q,
    $log,
    $http,
    $state,
    $ionicPopup,
    $ionicHistory,
    $ionicLoading,
    $cordovaNetwork,
    $ionicNavBarDelegate,
    Route,
    Marker,
    Geolocation,
    Config
) {

    var watch;

    var closedArrowIcon = {
        path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW
    };

    var busIcon = {
        path: 'M17.402,0H5.643C2.526,0,0,3.467,0,6.584v34.804c0,3.116,2.526,5.644,5.643,5.644h11.759c3.116,0,5.644-2.527,5.644-5.644 V6.584C23.044,3.467,20.518,0,17.402,0z M22.057,14.188v11.665l-2.729,0.351v-4.806L22.057,14.188z M20.625,10.773 c-1.016,3.9-2.219,8.51-2.219,8.51H4.638l-2.222-8.51C2.417,10.773,11.3,7.755,20.625,10.773z M3.748,21.713v4.492l-2.73-0.349 V14.502L3.748,21.713z M1.018,37.938V27.579l2.73,0.343v8.196L1.018,37.938z M2.575,40.882l2.218-3.336h13.771l2.219,3.336H2.575z M19.328,35.805v-7.872l2.729-0.355v10.048L19.328,35.805z',
        scale: .7,
        strokeColor: 'white',
        strokeWeight: .10,
        fillOpacity: 1,
        fillColor: '#404040',
        anchor: new google.maps.Point(10, 25)
    };

    /**
     * TODO: it must be refactored!
     *
     * @param {Route} model
     * @param {integer} limit
     * @return {undefined}
     */
    function saveViewedRoute(model, limit)
    {
        var _key = 'viewedRoutes';
        var $filter = $injector.get('$filter');
        var viewedRoutes = JSON.parse(localStorage.getItem(_key)) || [];
        var isViewed = $filter('filter')(viewedRoutes, {id: model.id}, true)[0];

        if (!isViewed) {
            model.viewed_at = new Date().getTime();
            viewedRoutes.reverse().push(model.getAttributes());
            viewedRoutes.reverse().splice(limit || 10,viewedRoutes.length-1);
            localStorage.setItem(_key, JSON.stringify(viewedRoutes));
        }
    }

    $scope.mapCreated = function(map){
        $scope.map = map;
        $scope.map.setZoom(15);
        Marker.init(map);
        $scope.init();
    }

    function snapToRoads(waypoints) {

        var route = [
            "https://roads.googleapis.com/v1/snapToRoads?interpolate=true",
            "&key=" + $scope.$config.API_KEY,
            "&path=" + waypoints.join('|'),
        ].join('');

        return $http.get(route).then(function (response) {

            $log.debug('snapToRoads:success', response);

            var tmp = [];

            for (var i in response.data.snappedPoints) {
                var point = response.data.snappedPoints[i];

                var pointLatLng = new google.maps.LatLng(
                    point.location.latitude,
                    point.location.longitude
                );

                tmp.push(pointLatLng);
            }

            return tmp;
        });
    }

    /**
     *
     * @return {undefined}
     */
    $scope.init = function() {

        var bounds  = new google.maps.LatLngBounds();
        var path = [];

        $scope.$A = Marker.createMarker('Point A');
        $scope.$B = Marker.createMarker('Point B');
        $scope.$C = Marker.createMarker('Point C');

        $scope.$A.setAnimation(google.maps.Animation.DROP);
        $scope.$B.setAnimation(google.maps.Animation.DROP);
        //$scope.$C.setAnimation(google.maps.Animation.DROP);

        $scope.$A.setZIndex(2);
        $scope.$B.setZIndex(1);
        $scope.$C.setZIndex(1);

        $scope.$A.setIcon('./img/markers/blue_MarkerA.png');
        $scope.$B.setIcon('./img/markers/red_MarkerB.png');
        $scope.$C.setIcon(busIcon);


        $scope.loading = $ionicLoading.show({
            template: 'Opening your route...'
        });

        $log.debug("Find the route waypoints..");

        var tracewaypoints = new google.maps.Polyline({
            map: $scope.map,
            strokeColor: "blue",
            strokeOpacity: 1.0,
            strokeWeight: 2,
            icons: [{
                icon: closedArrowIcon,
                offset: '100%'
            }/*, {
                icon: busIcon,
                offset: '10%',
            }*/]
        });

        Route.findOne($state.params.id).then(function (model) {

            $scope.model = model;
            saveViewedRoute(model, 10);

            $log.debug("Snap to road..");

            var chunked = $scope.model.simplify().chunk(100);

            chunked.forEach(function(points, i){

                if (i-1 >= 0) {
                    points.unshift(chunked[i-1][chunked[i-1].length-1]);
                }

                var waypoints = points.map(function(point){
                    return [point.lat(), point.lng()].join(',')
                });

                if (waypoints.length) {

                    snapToRoads(waypoints).then(function(points){

                        for (var i in points)
                            bounds.extend(points[i]);

                        path = path.concat(points);
                        tracewaypoints.setPath(path);

                        $scope.map.fitBounds(bounds);      // auto-zoom
                        $scope.map.panToBounds(bounds);    // auto-center

                        //$scope.map.setCenter(tmp[tmp.length-1]);
                        //$scope.map.setCenter(tmp[Math.ceil(tmp.length/2)]);

                        //Marker
                        //.createMarker('You are here!', tmp[tmp.length-1])
                        //.setPosition(tmp[tmp.length-1]);
                    }, function(response) {
                        $log.error('snapToRoads:error', response);
                        $scope.errorNoInternet();
                    })
//
//                    var route = [
//                        "https://roads.googleapis.com/v1/snapToRoads?interpolate=true",
//                        "&key=" + $scope.$config.API_KEY,
//                        "&path=" + waypoints.join('|'),
//                    ].join('');
//
//                    $http.get(route).then(function (response) {
//                        $log.debug('snapToRoads:success', response)
//
//                        var tmp = [];
//                        for (var i in response.data.snappedPoints) {
//                            var point = response.data.snappedPoints[i];
//
//                            var pointLatLng = new google.maps.LatLng(
//                                point.location.latitude,
//                                point.location.longitude
//                            );
//
//                            tmp.push(pointLatLng);
//                            bounds.extend(pointLatLng);
//                        }
//
//                        var tracewaypoints = new google.maps.Polyline({
//                            map: $scope.map,
//                            strokeColor: "blue",
//                            strokeOpacity: 1.0,
//                            strokeWeight: 2,
//                            icons: [{
//                                icon: closedArrowIcon,
//                                offset: '100%'
//                            }/*, {
//                                icon: busIcon,
//                                offset: '10%',
//                            }*/]
//                        });
//
//                        path = path.concat(tmp);
//                        tracewaypoints.setPath(tmp);
//
//                        $scope.map.fitBounds(bounds);      // auto-zoom
//                        $scope.map.panToBounds(bounds);    // auto-center
//
//                        //$scope.map.setCenter(tmp[tmp.length-1]);
//                        //$scope.map.setCenter(tmp[Math.ceil(tmp.length/2)]);
//
//                        //Marker
//                        //.createMarker('You are here!', tmp[tmp.length-1])
//                        //.setPosition(tmp[tmp.length-1]);
//
//
//
//                    }, function(response) {
//                        $log.error('snapToRoads:error', response);
//                        $scope.errorNoInternet();
//                    });
                }
            });


            //var waypoints = $scope.model.points.map(function(point){
            //    return new google.maps.LatLng(point.lat, point.lng);
            //}).map(function(point){
            //    bounds.extend(point);
            //    return point;
            //});
            //
            //$scope.map.fitBounds(bounds);      // auto-zoom
            //$scope.map.panToBounds(bounds);    // auto-center
            //
            //var tracewaypoints = new google.maps.Polyline({
            //    map: $scope.map,
            //    path: waypoints,
            //    strokeColor: "blue",
            //    strokeOpacity: 1.0,
            //    strokeWeight: 2,
            //    icons: [{
            //        icon: closedArrowIcon,
            //        offset: '100%'
            //    }/*, {
            //        icon: busIcon,
            //        offset: '10%',
            //    }*/]
            //});

            $scope.$A.setPosition($scope.model.getLatLngPoint(0));
            $scope.$B.setPosition($scope.model.getLatLngPoint(-1));

            $scope.watchPosition();
            $scope.watchDirection();

        }).catch(function(response){

            //$scope.errorInternal(response.data);
            $scope.errorNoInternet();

        }).finally(function(){
            try {
                $scope.loading.hide();
            } catch (e) {
                $ionicLoading.hide();
            }
        });
    }

    $scope.watchPosition = function () {

        if (!$scope.map) {
            return;
        }

        $scope.isWatching = true;

        $log.debug("Start watching locations..");

        // if (Geolocation.simulationEnabled()) {
        //     Geolocation
        //     .getGeolocationSimulator()
        //     .setFakeRoute({
        //         active: true,
        //         name: 'Fake route #1',
        //         speed: 60,
        //         interval: 500,
        //         points: [
        //             [37.803210, -122.285347],
        //         ]
        //     });
        // }

        watch = Geolocation.watchPosition({
            enableHighAccuracy: true,
            maximumAge: 3600000,
            timeout: 30000,
        }).then(null, onError, onSuccess);


        function onSuccess (position) {
            $log.debug('Got position:', position);

            var myLatlng = new google.maps.LatLng(
                position.coords.latitude,
                position.coords.longitude
            );

            $scope.$C.setPosition(myLatlng);
        }

        function onError (error) {
            $log.error('Unable to get location: ' + error.message, error);

            $scope.watchPosition();
        }
    };

    $scope.stopWatchingPosition = function(){
        $scope.isWatching = false;
        Geolocation.clearWatch(watch);

        try { // TODO:
            watch && watch.clearWatch();
        } catch (e) {};
    };

    var handleWatchingDirection = throttle(function (event) {

        var alpha = event.webkitCompassHeading
            ? event.webkitCompassHeading
            : event.alpha;

        if (event.absolute) {
            //$log.info('Compass heading: ' + Math.floor(alpha))

            var icon = $scope.$C.getIcon()
            icon.rotation = 360 - Math.floor(alpha);
            $scope.$C.setIcon(icon)
        }

    }, 250);


    $scope.watchDirection = function () {
        window.addEventListener("deviceorientation", handleWatchingDirection);
    };

    $scope.stopWatchingDirections = function(){
        window.removeEventListener("deviceorientation", handleWatchingDirection);
    };

    /**
     *
     * @return {unresolved}
     */
    $scope.errorNoInternet = function () {
        return $ionicPopup.confirm({
            title: "Internet is not working",
            content: "Internet is not working on your device. Please try again later."
        }).then(function(isOK){
            if (isOK) {
                $scope.init();
            } else {
                if (!$scope.showBackButton) {
                    var $location = $injector.get('$location');
                    $location.path('/');
                } else {
                    $ionicHistory.goBack();
                }
            }
        });
    }

    $scope.$on("$destroy", function () {
        $scope.stopWatchingPosition();
        $scope.stopWatchingDirections();
    });

    //$scope.$on("$ionicView.enter", function (event) {
    //    if (Geolocation.simulationEnabled()) {
    //        // do something
    //    }
    //});

    $scope.$on('$ionicView.leave', function(){
        $scope.stopWatchingPosition();
        $scope.stopWatchingDirections();
    });

    $scope.$on("$ionicView.beforeEnter", function (event) {
        var backView = $ionicHistory.viewHistory().backView;
        $scope.showBackButton = backView && (backView.stateName != 'app.route-create');
        $ionicNavBarDelegate.showBackButton($scope.showBackButton);
    });
});
