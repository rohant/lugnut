            /**
             * Prediction the next position by Geohash algorithm
             * Measurement error: ~ 88m
             */
            //if (waypoints.length) 
            //{
            //    var lastPosition = waypoints[waypoints.length-1];
            //
            //    if (lastPosition) {
            //
            //        var spherical = google.maps.geometry.spherical;
            //
            //        //var averageDistance = tracewaypoints.inKm() / waypoints.length;
            //        var averageDistance = spherical.computeLength(tracewaypoints.getPath()) / waypoints.length;
            //        var precision = Geohash.precision(averageDistance, 7);
            //
            //        $log.info('Average distance: ' + averageDistance);
            //        $log.info('Precision: ' + precision);
            //
            //        var heading = spherical.computeHeading(lastPosition, myLatlng);
            //        heading = Math.abs(360 - Math.abs(heading));
            //
            //        var direction = getDirectionByAngle(heading);
            //        var geohash = Geohash.encode(myLatlng.lat(), myLatlng.lng(), precision);
            //
            //        try {
            //            var predictHash = Geohash.adjacent(geohash, direction.toLowerCase());
            //            var predictPoint = Geohash.decode(predictHash);
            //
            //            $log.info('Direction: ' + direction);
            //            $log.info('Predict point: ', predictPoint);
            //
            //            var ppM = Marker.createMarker('Predicted Point!');
            //            ppM.setIcon('./img/markers/yellow_MarkerB.png');
            //            ppM.setPosition(new google.maps.LatLng(
            //                predictPoint.lat, predictPoint.lon
            //            ));
            //
            //            predictPoints.push(ppM);
            //
            //        } catch (e) {}
            //    }
            //}