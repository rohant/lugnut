angular.module('app.services')

.factory('Route', function ($injector, $interval, $timeout, $log, $http, $q, Config) {

    var routes = {}, pointer = 0;

    var RouteModel = function(data){
        this.id = null;
        this.title = [];
        this.points = [];

        if (data) {
            this.setData(data);
        }
    };

    RouteModel.prototype.setData = function (data) {
        angular.extend(this, data);
    };

    RouteModel.prototype.addPoint = function (point) {
        this.points.push(point);
        return this;
    };

    RouteModel.prototype.delete = function () {
        delete routes[this.id];

        console.log('RouteModel:delete')

        localStorage.setItem('routes', JSON.stringify(routes));

        return true;
    };

    RouteModel.prototype.save = function () {
        this.id = pointer++;
        this.created = new Date().getTime();
        routes[this.id] = this;

        localStorage.setItem('routes', JSON.stringify(routes));

        return this.id;
    };

    RouteModel.prototype.getLatLngPoints = function () {
        var tmp = [];
        for (var i in this.points) {
            tmp.push(new google.maps.LatLng(
                this.points[i].lat,
                this.points[i].lng
            ));
        }
        return tmp;
    };

    var route = {

        findAll: function () {
            var scope = this;
            var deferred = $q.defer();
            //var routes = [];

            if (!routes.length) {
                var tmp = JSON.parse(localStorage.getItem('routes'));

                for (var i in tmp ) {
                    routes[tmp[i].id] = new RouteModel(tmp[i]);
                }

                console.log('routes', routes);
            }

            deferred.resolve(routes);

            //$http.get(apiUrl + '/routes').success(function (array) {
            //    array.forEach(function (data) {
            //        routes.push(new RouteModel(data));
            //    });
            //    deferred.resolve(routes);
            //}).error(function () {
            //    deferred.reject();
            //});

            return deferred.promise;
        },
        findOne: function (id) {
            var scope = this;
            var deferred = $q.defer();

            if (!routes.length) {
                var tmp = JSON.parse(localStorage.getItem('routes'));

                for (var i in tmp ) {
                    routes[tmp[i].id] = new RouteModel(tmp[i]);
                }

                console.log('routes', routes);
            }

            deferred.resolve(routes[id]);


            //var data = {};
            //$http.get(apiUrl + '/routes/' + id).success(function (data) {
            //    deferred.resolve(new RouteModel(data));
            //})
            //.error(function () {
            //    deferred.reject();
            //});

            return deferred.promise;
        },

        createEmpty: function (data) {
            return new RouteModel(data);
        }
    };

    return route;
})