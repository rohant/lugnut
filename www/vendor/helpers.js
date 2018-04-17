
//function latlng2distance(lat1, long1, lat2, long2) {
//    var R = 6372795;
//
//    lat1 *= Math.PI / 180;
//    lat2 *= Math.PI / 180;
//    long1 *= Math.PI / 180;
//    long2 *= Math.PI / 180;
//
//    var cl1 = Math.cos(lat1);
//    var cl2 = Math.cos(lat2);
//    var sl1 = Math.sin(lat1);
//    var sl2 = Math.sin(lat2);
//    var delta = long2 - long1;
//    var cdelta = Math.cos(delta);
//    var sdelta = Math.sin(delta);
//
//    var y = Math.sqrt(Math.pow(cl2 * sdelta, 2) + Math.pow(cl1 * sl2 - sl1 * cl2 * cdelta, 2));
//    var x = sl1 * sl2 + cl1 * cl2 * cdelta;
//    var ad = Math.atan2(y, x);
//    var dist = ad * R;
//    return dist
//}



//var rad = function(x) {
//  return x * Math.PI / 180;
//};
//
//var getDistance = function(p1, p2) {
//  var R = 6378137; // Earth’s mean radius in meter
//  var dLat = rad(p2.lat() - p1.lat());
//  var dLong = rad(p2.lng() - p1.lng());
//  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//    Math.cos(rad(p1.lat())) * Math.cos(rad(p2.lat())) *
//    Math.sin(dLong / 2) * Math.sin(dLong / 2);
//  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//  var d = R * c;
//  return d; // returns the distance in meter
//};

//google.maps.LatLng.prototype.distanceFrom = function(latlng) {
//  var lat = [this.lat(), latlng.lat()]
//  var lng = [this.lng(), latlng.lng()]
//  var R = 6378137;
//  var dLat = (lat[1]-lat[0]) * Math.PI / 180;
//  var dLng = (lng[1]-lng[0]) * Math.PI / 180;
//  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
//  Math.cos(lat[0] * Math.PI / 180 ) * Math.cos(lat[1] * Math.PI / 180 ) *
//  Math.sin(dLng/2) * Math.sin(dLng/2);
//  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
//  var d = R * c;
//  return Math.round(d);
//}