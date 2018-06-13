/*********************************************************************\
*                                                                     *
* epolys.js                                          by Mike Williams *
* updated to API v3                                  by Larry Ross    *
*                                                                     *
* A Google Maps API Extension                                         *
*                                                                     *
* Adds various Methods to google.maps.Polygon and google.maps.Polyline *
*                                                                     *
* .Contains(latlng) returns true is the poly contains the specified   *
*                   GLatLng                                           *
*                                                                     *
* .Area()           returns the approximate area of a poly that is    *
*                   not self-intersecting                             *
*                                                                     *
* .Distance()       returns the length of the poly path               *
*                                                                     *
* .Bounds()         returns a GLatLngBounds that bounds the poly      *
*                                                                     *
* .GetPointAtDistance() returns a GLatLng at the specified distance   *
*                   along the path.                                   *
*                   The distance is specified in metres               *
*                   Reurns null if the path is shorter than that      *
*                                                                     *
* .GetPointsAtDistance() returns an array of GLatLngs at the          *
*                   specified interval along the path.                *
*                   The distance is specified in metres               *
*                                                                     *
* .GetIndexAtDistance() returns the vertex number at the specified    *
*                   distance along the path.                          *
*                   The distance is specified in metres               *
*                   Returns null if the path is shorter than that      *
*                                                                     *
* .Bearing(v1?,v2?) returns the bearing between two vertices          *
*                   if v1 is null, returns bearing from first to last *
*                   if v2 is null, returns bearing from v1 to next    *
*                                                                     *
*                                                                     *
***********************************************************************
*                                                                     *
*   This Javascript is provided by Mike Williams                      *
*   Blackpool Community Church Javascript Team                        *
*   http://www.blackpoolchurch.org/                                   *
*   http://econym.org.uk/gmap/                                        *
*                                                                     *
*   This work is licenced under a Creative Commons Licence            *
*   http://creativecommons.org/licenses/by/2.0/uk/                    *
*                                                                     *
***********************************************************************
*                                                                     *
* Version 1.1       6-Jun-2007                                        *
* Version 1.2       1-Jul-2007 - fix: Bounds was omitting vertex zero *
*                                add: Bearing                         *
* Version 1.3       28-Nov-2008  add: GetPointsAtDistance()           *
* Version 1.4       12-Jan-2009  fix: GetPointsAtDistance()           *
* Version 3.0       11-Aug-2010  update to v3                         *
*                                                                     *
\*********************************************************************/

// === first support methods that don't (yet) exist in v3
google.maps.LatLng.prototype.distanceFrom = function (newLatLng) {
    var EarthRadiusMeters = 6378137.0; // meters
    var lat1 = this.lat();
    var lon1 = this.lng();
    var lat2 = newLatLng.lat();
    var lon2 = newLatLng.lng();
    var dLat = (lat2 - lat1) * Math.PI / 180;
    var dLon = (lon2 - lon1) * Math.PI / 180;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = EarthRadiusMeters * c;
    return d;
}

google.maps.LatLng.prototype.latRadians = function () {
    return this.lat() * Math.PI / 180;
}

google.maps.LatLng.prototype.lngRadians = function () {
    return this.lng() * Math.PI / 180;
}

// === A method which returns the length of a path in metres ===
google.maps.Polygon.prototype.Distance = function () {
    var dist = 0;
    for (var i = 1; i < this.getPath().getLength(); i++) {
        dist += this.getPath().getAt(i).distanceFrom(this.getPath().getAt(i - 1));
    }
    return dist;
}

// === A method which returns a GLatLng of a point a given distance along the path ===
// === Returns null if the path is shorter than the specified distance ===
google.maps.Polygon.prototype.GetPointAtDistance = function (metres) {
    // some awkward special cases
    if (metres == 0) return this.getPath().getAt(0);
    if (metres < 0) return null;
    if (this.getPath().getLength() < 2) return null;
    var dist = 0;
    var olddist = 0;
    for (var i = 1;
    (i < this.getPath().getLength() && dist < metres); i++) {
        olddist = dist;
        dist += this.getPath().getAt(i).distanceFrom(this.getPath().getAt(i - 1));
    }
    if (dist < metres) {
        return null;
    }
    var p1 = this.getPath().getAt(i - 2);
    var p2 = this.getPath().getAt(i - 1);
    var m = (metres - olddist) / (dist - olddist);
    return new google.maps.LatLng(p1.lat() + (p2.lat() - p1.lat()) * m, p1.lng() + (p2.lng() - p1.lng()) * m);
}

// === A method which returns an array of GLatLngs of points a given interval along the path ===
google.maps.Polygon.prototype.GetPointsAtDistance = function (metres) {
    var next = metres;
    var points = [];
    // some awkward special cases
    if (metres <= 0) return points;
    var dist = 0;
    var olddist = 0;
    for (var i = 1;
    (i < this.getPath().getLength()); i++) {
        olddist = dist;
        dist += this.getPath().getAt(i).distanceFrom(this.getPath().getAt(i - 1));
        while (dist > next) {
            var p1 = this.getPath().getAt(i - 1);
            var p2 = this.getPath().getAt(i);
            var m = (next - olddist) / (dist - olddist);
            points.push(new google.maps.LatLng(p1.lat() + (p2.lat() - p1.lat()) * m, p1.lng() + (p2.lng() - p1.lng()) * m));
            next += metres;
        }
    }
    return points;
}

// === A method which returns the Vertex number at a given distance along the path ===
// === Returns null if the path is shorter than the specified distance ===
google.maps.Polygon.prototype.GetIndexAtDistance = function (metres) {
    // some awkward special cases
    if (metres == 0) return this.getPath().getAt(0);
    if (metres < 0) return null;
    var dist = 0;
    var olddist = 0;
    for (var i = 1;
    (i < this.getPath().getLength() && dist < metres); i++) {
        olddist = dist;
        dist += this.getPath().getAt(i).distanceFrom(this.getPath().getAt(i - 1));
    }
    if (dist < metres) {
        return null;
    }
    return i;
}

// === Copy all the above functions to GPolyline ===
google.maps.Polyline.prototype.Distance = google.maps.Polygon.prototype.Distance;
google.maps.Polyline.prototype.GetPointAtDistance = google.maps.Polygon.prototype.GetPointAtDistance;
google.maps.Polyline.prototype.GetPointsAtDistance = google.maps.Polygon.prototype.GetPointsAtDistance;
google.maps.Polyline.prototype.GetIndexAtDistance = google.maps.Polygon.prototype.GetIndexAtDistance;




// calculate distance
google.maps.LatLng.prototype.kmTo = function(a){ 
    var e = Math, ra = e.PI/180; 
    var b = this.lat() * ra, c = a.lat() * ra, d = b - c; 
    var g = this.lng() * ra - a.lng() * ra; 
    var f = 2 * e.asin(e.sqrt(e.pow(e.sin(d/2), 2) + e.cos(b) * e.cos 
    (c) * e.pow(e.sin(g/2), 2))); 
    return f * 6378.137; 
}
// returns length of the poliline
google.maps.Polyline.prototype.inKm = function(n){ 
    var a = this.getPath(n), len = a.getLength(), dist = 0; 
    for (var i=0; i < len-1; i++) { 
       dist += a.getAt(i).kmTo(a.getAt(i+1)); 
    }
    return dist; 
}


/* Javascript implementation of the Douglas Peucker path simplification algorithm
/*  
/* Usage:
/* 
/* var pl = new google.maps.Polyline({...});
/* var simplifiedLinePath = pl.simplifyLine(0.00045);
/* var simplifiedLine = new google.maps.Polyline({map: gmap, path: simplifiedLinePath});
 */
//if (typeof google.maps.Polyline.prototype.simplifyLine == 'undefined') {
//    google.maps.Polyline.prototype.simplifyLine = function(tolerance){
//        var res = null;
//
//        if(this.getPath() && this.getPath().getLength()){
//            var points = this.getPath().getArray();
//
//            var Line = function( p1, p2 ) {
//                this.p1 = p1;
//                this.p2 = p2;
//
//                this.distanceToPoint = function( point ) {
//                    // slope
//                    var m = ( this.p2.lat() - this.p1.lat() ) / ( this.p2.lng() - this.p1.lng() ),
//                        // y offset
//                        b = this.p1.lat() - ( m * this.p1.lng() ),
//                        d = [];
//                    // distance to the linear equation
//                    d.push( Math.abs( point.lat() - ( m * point.lng() ) - b ) / Math.sqrt( Math.pow( m, 2 ) + 1 ) );
//                    // distance to p1
//                    d.push( Math.sqrt( Math.pow( ( point.lng() - this.p1.lng() ), 2 ) + Math.pow( ( point.lat() - this.p1.lat() ), 2 ) ) );
//                    // distance to p2
//                    d.push( Math.sqrt( Math.pow( ( point.lng() - this.p2.lng() ), 2 ) + Math.pow( ( point.lat() - this.p2.lat() ), 2 ) ) );
//                    // return the smallest distance
//                    return d.sort( function( a, b ) {
//                        return ( a - b ); //causes an array to be sorted numerically and ascending
//                    } )[0];
//                };
//            };
//
//            var douglasPeucker = function( points, tolerance ) {
//                if ( points.length <= 2 ) {
//                    return [points[0]];
//                }
//                var returnPoints = [],
//                    // make line from start to end 
//                    line = new Line( points[0], points[points.length - 1] ),
//                    // find the largest distance from intermediate poitns to this line
//                    maxDistance = 0,
//                    maxDistanceIndex = 0,
//                    p;
//                for( var i = 1; i <= points.length - 2; i++ ) {
//                    var distance = line.distanceToPoint( points[ i ] );
//                    if( distance > maxDistance ) {
//                        maxDistance = distance;
//                        maxDistanceIndex = i;
//                    }
//                }
//                // check if the max distance is greater than our tollerance allows 
//                if ( maxDistance >= tolerance ) {
//                    p = points[maxDistanceIndex];
//                    line.distanceToPoint( p, true );
//                    // include this point in the output 
//                    returnPoints = returnPoints.concat( douglasPeucker( points.slice( 0, maxDistanceIndex + 1 ), tolerance ) );
//                    // returnPoints.push( points[maxDistanceIndex] );
//                    returnPoints = returnPoints.concat( douglasPeucker( points.slice( maxDistanceIndex, points.length ), tolerance ) );
//                } else {
//                    // ditching this point
//                    p = points[maxDistanceIndex];
//                    line.distanceToPoint( p, true );
//                    returnPoints = [points[0]];
//                }
//                return returnPoints;
//            };
//            res = douglasPeucker( points, tolerance );
//            // always have to push the very last point on so it doesn't get left off
//            res.push( points[points.length - 1 ] );
//        }
//        return res;
//    };
//}



/**
 * 
 * @param {window} w
 * @return {undefined}
 */
;(function(w){
    
    /**
     * Javascript implementation of the Ramer Douglas Peucker path simplification algorithm
     * Wiki: https://en.wikipedia.org/wiki/Ramer%E2%80%93Douglas%E2%80%93Peucker_algorithm
     * Based on: https://github.com/seabre/simplify-geometry
     * 
     * @param {Array} points
     * @param {Float} tolerance
     * @return {Array}
     */
    var simplifyLine = function(points, tolerance){

      var dmax = 0;
      var index = 0;

      for (var i = 1; i <= points.length - 2; i++){
        var d = new Line(points[0], points[points.length - 1]).perpendicularDistance(points[i]);
        if (d > dmax){
          index = i;
          dmax = d;
        }
      }

      if (dmax > tolerance){
        var results_one = simplifyLine(points.slice(0, index), tolerance);
        var results_two = simplifyLine(points.slice(index, points.length), tolerance);

        var results = results_one.concat(results_two);
      }

      else if (points.length > 1) {
        results = [points[0], points[points.length - 1]];
      }

      else {
        results = [points[0]];
      }

      return results;
    }

    var Line = function(p1, p2){
      this.p1 = p1;
      this.p2 = p2;
    };

    Line.prototype.rise = function() {
      return this.p2[1] - this.p1[1];
    };

    Line.prototype.run = function() {
      return this.p2[0] - this.p1[0];
    };

    Line.prototype.slope = function(){
      return  this.rise() / this.run();
    };

    Line.prototype.yIntercept = function(){
      return this.p1[1] - (this.p1[0] * this.slope(this.p1, this.p2));
    };

    Line.prototype.isVertical = function() {
      return !isFinite(this.slope());
    };

    Line.prototype.isHorizontal = function() {
      return this.p1[1] == this.p2[1];
    };

    Line.prototype._perpendicularDistanceHorizontal = function(point){
      return Math.abs(this.p1[1] - point[1]);
    };

    Line.prototype._perpendicularDistanceVertical = function(point){
      return Math.abs(this.p1[0] - point[0]);
    };

    Line.prototype._perpendicularDistanceHasSlope = function(point){
      var slope = this.slope();
      var y_intercept = this.yIntercept();

      return Math.abs((slope * point[0]) - point[1] + y_intercept) / Math.sqrt((Math.pow(slope, 2)) + 1);
    };

    Line.prototype.perpendicularDistance = function(point){
        
      if (this.isVertical()) {
        return this._perpendicularDistanceVertical(point);
      }
      else if (this.isHorizontal()){
        return this._perpendicularDistanceHorizontal(point);
      }
      else {
        return this._perpendicularDistanceHasSlope(point);
      }
    };

    w.simplifyLine = simplifyLine;

}(window));

//var linestring = [[0,0], [2.5,3], [5,0]];
//console.log(simplifyLine(linestring, 2.9));
//console.log(simplifyLine(linestring, 3));