// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};

// Returns a function, that, when invoked, will only be triggered at most once
// during a given window of time. Normally, the throttled function will run
// as much as it can, without ever going more than once per `wait` duration;
// but if you'd like to disable the execution on the leading edge, pass
// `{leading: false}`. To disable execution on the trailing edge, ditto.
function throttle(func, wait, options) {
  var context, args, result;
  var timeout = null;
  var previous = 0;
  if (!options) options = {};
  var later = function() {
    previous = options.leading === false ? 0 : Date.now();
    timeout = null;
    result = func.apply(context, args);
    if (!timeout) context = args = null;
  };
  return function() {
    var now = Date.now();
    if (!previous && options.leading === false) previous = now;
    var remaining = wait - (now - previous);
    context = this;
    args = arguments;
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining);
    }
    return result;
  };
};


function once(fn, context) {
	var result;
	return function() { 
		if(fn) {
			result = fn.apply(context || this, arguments);
			fn = null;
		}
		return result;
	};
}




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


/**
 * Converts degrees to radians
 * 
 * @param {Number} x
 * @return {Number}
 */
var rad = function (x) {
    return x * Math.PI / 180;
};

/**
 * Returns the distance in meter
 * 
 * @param {latLng} p1
 * @param {latLng} p2
 * @return {Number}
 */
var getDistance = function (p1, p2) {
    var R = 6378137; // Earth’s mean radius in meter
    var dLat = rad(p2.lat() - p1.lat());
    var dLong = rad(p2.lng() - p1.lng());
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(rad(p1.lat())) * Math.cos(rad(p2.lat())) *
            Math.sin(dLong / 2) * Math.sin(dLong / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return Math.round(d * 100) / 100;
};


//
//var earth_radius_km = 6371.0;
//
//function deg_to_rad(deg) {
//    return (deg * Math.PI / 180.0);
//}
//
//function haversine_distance(latitude1, longitude1, latitude2, longitude2) {
//    var lat1 = deg_to_rad(latitude1);
//    var lng1 = deg_to_rad(longitude1);
//    var lat2 = deg_to_rad(latitude2);
//    var lng2 = deg_to_rad(longitude2);
//
//    var d_lat = Math.abs(lat1 - lat2);
//    var d_lng = Math.abs(lng1 - lng2);
//
//    var a = Math.pow(Math.sin(d_lat / 2.0), 2.0) + Math.cos(lat1)
//            * Math.cos(lat2) * Math.pow(Math.sin(d_lng / 2.0), 2.0);
//
//    var d_sigma = 2.0 * Math.asin(Math.sqrt(a));
//
//    return (earth_radius_km * d_sigma);
//}
//
//function vincenty_distance(latitude1, longitude1, latitude2, longitude2) {
//    var lat1 = deg_to_rad(latitude1);
//    var lng1 = deg_to_rad(longitude1);
//    var lat2 = deg_to_rad(latitude2);
//    var lng2 = deg_to_rad(longitude2);
//
//    var d_lng = Math.abs(lng1 - lng2);
//
//    // Numerator
//    var a = Math.pow(Math.cos(lat2) * Math.sin(d_lng), 2.0);
//
//    var b = Math.cos(lat1) * Math.sin(lat2);
//    var c = Math.sin(lat1) * Math.cos(lat2) * Math.cos(d_lng);
//    var d = Math.pow(b - c, 2.0);
//
//    var e = Math.sqrt(a + d);
//
//    // Denominator
//    var f = Math.sin(lat1) * Math.sin(lat2);
//    var g = Math.cos(lat1) * Math.cos(lat2) * Math.cos(d_lng);
//
//    var h = f + g;
//
//    var d_sigma = Math.atan2(e, h);
//
//    return (earth_radius_km * d_sigma);
//}




/* 
 * INTERPOLATION 
 */


// This is our Linear Interpolation method. It takes 3 parameters:
// a: The starting value
// b: The destination value
// n: The normal value (between 0 and 1) to control the Linear Interpolation
//
// If your normal value is equal to 1 the circle will instantly switch from A to B.
// If your normal value is equal to 0 the circle will not move.
// The closer your normal is to 0 the smoother will be the interpolation.
// The closer your normal is to 1 the sharper will be the interpolation.
function lerp(a, b, n) {
  return (1 - n) * a + n * b;
}

// Obtient une valeur comprise dans un interval
Math.clamp = function (value, min, max) {
	return Math.min(Math.max(value, min), max);
};

// Obtient une interpolation linéaire entre 2 valeurs
Math.lerp = function (value1, value2, amount) {
	amount = amount < 0 ? 0 : amount;
	amount = amount > 1 ? 1 : amount;
	return (1 - amount) * value1 + amount * value2;
};

Math.wrap = function(inValue, inMin, inMax) {
    var valueRange = inMax - inMin;
    return (inMin + ((((inValue - inMin) % valueRange) + valueRange) % valueRange));
}
// Use it like this:
//angle = Math.wrap(angle, 0, 360); // wrap between 0 & 360°
//angle = Math.wrap(angle, -90, +90); // wrap between +/-90°



//// OP's algorithm
//function lerp1 (a, b, f) {
//    return (a * (1.0 * f - f)) + (b * f);
//}
//
//// Algebraically simplified algorithm
//function lerp2 (a, b, f) {
//    return a + f * (b - a);
//}
//
//console.log('lerp', lerp(1, 3, 0.5),lerp(1, 3, 0.1),lerp(1, 10, 0.5),lerp(1, 10, 0.1));
//console.log('lerp1', lerp1(1, 3, 0.5),lerp1(1, 3, 0.1),lerp1(1, 10, 0.5),lerp1(1, 10, 0.1));
//console.log('lerp2', lerp2(1, 3, 0.5),lerp2(1, 3, 0.1),lerp2(1, 10, 0.5),lerp2(1, 10, 0.1));





//var convert = {
//    toCompass: function(degrees)
//    {
//        return ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW', 'N'][Math.round(degrees / 11.25 / 2)];
//    }
//}
//alert(convert.toCompass(140));      // SE
//console.log('Compass direction:', convert.toCompass(360 - Math.floor(alpha)));

function getCompassDirection(degrees) {
    return ['N','NNW','NW','WNW','W','WSW','SW','SSW','S','SSE','SE','ESE','E','ENE','NE','NNE','N'][Math.round(degrees/11.25/2)];
}
//console.log('Compass direction:',getCompassDirection(140));      // SE



//var query = window.matchMedia("(orientation:landscape)");
//console.log("Device held " + (query.matches ? "horizontally" : "vertically"));


//if (window.DeviceOrientationEvent) {
//    window.addEventListener('deviceorientation', function (event) {
//        var alpha = event.alpha;
//        var beta = event.beta;
//        var gamma = event.gamma;
//
//        if (alpha != null || beta != null || gamma != null)
//            console.log('deviceorientation','alpha: ' + alpha + ' beta: ' + beta + ' gamma: ' + gamma);
//        
//    }, false);
//}
//
//// Check for support for DeviceMotion events
//if (window.DeviceMotionEvent) {
//    window.addEventListener('devicemotion', function (event) {
//        var x = event.accelerationIncludingGravity.x;
//        var y = event.accelerationIncludingGravity.y;
//        var z = event.accelerationIncludingGravity.z;
//        
//        var r = event.rotationRate;
//        var ralpha = event.rotationRate.alpha;
//        var rbeta = event.rotationRate.beta;
//        var rgamma = event.rotationRate.gamma;
//        
//        var interval = event.interval;
//        
//        var html = "Acceleration:\n";
//        html += "x: " + x + "\ny: " + y + "\nz: " + z + "\n";
//        html += "Rotation rate:\n";
//        if (r != null)
//            html += "alpha: " + r.alpha + "\nbeta: " + r.beta + "\ngamma: " + r.gamma + "\n";
//        
//        console.log('devicemotion', html);
//    });
//}


//if (window.DeviceOrientationEvent) {
//    window.addEventListener("deviceorientation", function (event) {
//
//
//        var alpha = event.webkitCompassHeading 
//            ? event.webkitCompassHeading 
//            : event.alpha;
//
//        if (event.absolute) {
//            //console.log('Compass heading:', Math.floor(alpha));
//            //console.log('Compass direction:', getCompassDirection(Math.floor(alpha)));
//            //console.log('Compass direction:', convert.toCompass(360 - Math.floor(alpha)));
//
//        }
//        //if (window.orientation == 90 || window.orientation == -90) {
//        //    console.log('landscape mode')
//        //} else {
//        //    console.log('portrait mode')
//        //}
//
//        /*var $rs = $injector.get('$rootScope');
//        $rs.$broadcast('log:updated', {
//            logs: service.logs
//        });*/
//    });
//}