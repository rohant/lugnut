/**
GreatCircle
===========
A set of three functions, useful in geographical calculations of different sorts. Available for PHP, Python, Javascript and Ruby.

[Live demo](http://mw.gg/gc/) of the JavaScript implementation.

### Usage with node.js
Install npm module `great-circle`
```
npm install great-circle
```
Usage in node.js or with browserify
```javascript
var GreatCircle = require('great-circle')
```
### Distance
Takes two sets of geographic coordinates in decimal degrees and produces distance along the great circle line. Output in kilometers by default.

JavaScript:
```javascript
document.write ( GreatCircle.distance(51.507222, -0.1275, 48.8567, 2.3508) );
```

Optional fifth argument allows to specify desired units:
* M - meters
* KM - kilometers
* MI - miles
* NM - nautical miles
* YD - yards
* FT - feet

```php
// Distance from JFK airport to La Guardia airport in feet
echo GreatCircle::distance(40.63980103, -73.77890015, 40.77719879, -73.87259674, "FT");
// Output: 56425.612628758
```
The optional argument can also be passed in form of planet radius in any unit, to produce output in this unit.
```php
// Distance between North and South poles on Mars (3389.5 is mean radius of Mars in kilometers)
echo GreatCircle::distance(90, 0, -90, 0, 3389.5);
// Output: 10648.428299343
```
```php
// Distance between Moscow and New York in furlongs (31670.092 is Earth radius in furlongs)
echo GreatCircle::distance(55.75, 37.616667, 40.7127, -74.0059, 31670.092);
// Output: 37335.295755141
```
### Bearing
Takes two sets of geographic coordinates in decimal degrees and produces bearing (azimuth) from the first set of coordinates to the second set.
```php
// Bearing from Paris to London in decimal degrees
echo GreatCircle::bearing(48.8567, 2.3508, 51.507222, -0.1275);
// Output: 330.03509575101
```
### Destination
Takes one set of geographic coordinates in decimal degrees, azimuth and distance to produce a new set of coordinates, specified distance and bearing away from original.
```php
// Coordinates of a location 100 KM away from Paris, traveling in the direction of London
$dest = GreatCircle::destination(48.8567, 2.3508, 330.035, 100);
printf("Latitude: %f, Longitude: %f", $dest["LAT"], $dest["LON"]);
// Output: Latitude: 49.633753, Longitude: 1.657274
```
Just like Distance, Destination assumes entered distance is in kilometers, but takes an optional argument to specify desired unit.
```php
// Coordinates of a location 500 nautical miles away from Paris, traveling in the direction of New York
$brg = GreatCircle::bearing(48.8567, 2.3508, 40.7127, -74.0059);
$dest = GreatCircle::destination(48.8567, 2.3508, $brg, 500, "NM");
printf("Latitude: %f, Longitude: %f", $dest["LAT"], $dest["LON"]);
// Output: Latitude: 51.306719, Longitude: -10.071875
```
*/


var GreatCircle = {

    validateRadius: function(unit) {
        var r = {'M': 6371009, 'KM': 6371.009, 'MI': 3958.761, 'NM': 3440.070, 'YD': 6967420, 'FT': 20902260};
        if ( unit in r ) return r[unit];
        else return unit;
    },

    distance: function(lat1, lon1, lat2, lon2, unit) {
        if ( unit === undefined ) unit = 'KM';
        var r = this.validateRadius(unit); 
        lat1 *= Math.PI / 180;
        lon1 *= Math.PI / 180;
        lat2 *= Math.PI / 180;
        lon2 *= Math.PI / 180;
        var lonDelta = lon2 - lon1;
        var a = Math.pow(Math.cos(lat2) * Math.sin(lonDelta) , 2) + Math.pow(Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lonDelta) , 2);
        var b = Math.sin(lat1) * Math.sin(lat2) + Math.cos(lat1) * Math.cos(lat2) * Math.cos(lonDelta);
        var angle = Math.atan2(Math.sqrt(a) , b);
        
        return angle * r;
    },
    
    bearing: function(lat1, lon1, lat2, lon2) {
        lat1 *= Math.PI / 180;
        lon1 *= Math.PI / 180;
        lat2 *= Math.PI / 180;
        lon2 *= Math.PI / 180;
        var lonDelta = lon2 - lon1;
        var y = Math.sin(lonDelta) * Math.cos(lat2);
        var x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lonDelta);
        var brng = Math.atan2(y, x);
        brng = brng * (180 / Math.PI);
        
        if ( brng < 0 ) { brng += 360; }
        
        return brng;
    },
    
    destination: function(lat1, lon1, brng, dt, unit) {
        if ( unit === undefined ) unit = 'KM';
        var r = this.validateRadius(unit);
        lat1 *= Math.PI / 180;
        lon1 *= Math.PI / 180;
        var lat3 = Math.asin(Math.sin(lat1) * Math.cos(dt / r) + Math.cos(lat1) * Math.sin(dt / r) * Math.cos( brng * Math.PI / 180 ));
        var lon3 = lon1 + Math.atan2(Math.sin( brng * Math.PI / 180 ) * Math.sin(dt / r) * Math.cos(lat1) , Math.cos(dt / r) - Math.sin(lat1) * Math.sin(lat3));
        
        return {
            'LAT': lat3 * 180 / Math.PI,
            'LON': lon3 * 180 / Math.PI
        };
    }

}

if (typeof module != 'undefined' && module.exports) {
    module.exports = GreatCircle;
} else {
    window['GreatCircle'] = GreatCircle;
}


//function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
//  var R = 6371; // Radius of the earth in km
//  var dLat = deg2rad(lat2-lat1);  // deg2rad below
//  var dLon = deg2rad(lon2-lon1); 
//  var a = 
//    Math.sin(dLat/2) * Math.sin(dLat/2) +
//    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
//    Math.sin(dLon/2) * Math.sin(dLon/2)
//    ; 
//  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
//  var d = R * c; // Distance in km
//  return d;
//}
//
//function deg2rad(deg) {
//  return deg * (Math.PI/180)
//}