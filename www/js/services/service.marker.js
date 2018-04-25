angular.module('app.services')

.factory('Marker', function ($injector, $interval, $timeout, $log, $q, Config) {

    var service = {
        _map: null,
        _info: null,
        _marker: null,

        init: function(map){
            this._map = map;
            return this;
        },

        current: function(position, title){
            var self = this;

            var latLng = new google.maps.LatLng(
                position.coords.latitude,
                position.coords.longitude
            );

            if (!this._info) {
                this._info = new google.maps.InfoWindow({
                   size: new google.maps.Size(150, 50)
                });
            }

            if (!this._marker) {
                this._marker = self.createMarker(title || 'You are here!', latLng);

                google.maps.event.addListener(self._marker, 'click', function (e) {
                    self._info.open(self._map, self._marker);
                    return true;
                });
            }

            this._info.setContent(this._content(position));
            this._marker.setPosition(latLng);

            return this._marker;
        },

        _content: function(position){
            var geoInfo = (
                'Latitude: ' + position.coords.latitude + ";<br>\n" +
                'Longitude: ' + position.coords.longitude + ";<br>\n" +
                'Altitude: ' + position.coords.altitude + ";<br>\n" +
                'Accuracy: ' + position.coords.accuracy + ";<br>\n" +
                'Altitude Accuracy: ' + position.coords.altitudeAccuracy + ";<br>\n" +
                'Heading: ' + position.coords.heading + ";<br>\n" +
                'Speed: ' + position.coords.speed + ";<br>\n" +
                'Timestamp: ' + position.timestamp + ";<br>\n"
            );

            return '<b>Info:</b><br>' + geoInfo;
        },

        createMarker: function(title, latLng){
            var counter = 0;

            return (function(self){
                return new google.maps.Marker({
                    map: self._map,
                    title: title || 'Point - ' + counter++,
                    //zIndex: Math.round(latLng.lat() * -100000) << 5
                });
            }(this));
        },
    };

    return service;
})