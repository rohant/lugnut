angular.module('app.services')

.factory('Route', function ($injector, $log, $http, $q, Config) {

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
        console.log('RouteModel:delete')
        storage.delete(this.id);
        return true;
    };

    RouteModel.prototype.save = function () {
        console.log('RouteModel:save')
        this.created = new Date().getTime();
        return storage.add(this);
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

    var storage = {
        _i: 0,
        _data: {},
        _key: 'routes',

        getPk: function(i){
            return '_' + i;
        },

        update: function(){
            localStorage.setItem(this._key, JSON.stringify(this._data));
            console.log('updated:', this._data, this._i);
            return this;
        },
        data: function(id){
            if (!Object.keys(this._data).length) {
                var tmp = JSON.parse(localStorage.getItem(this._key));
                if (tmp) {
                    for (var i in tmp ) {
                        this._data[this.getPk(+tmp[i].id)] = new RouteModel(tmp[i]);
                    }
                    this._i = +Math.max.apply(null, Object.getIDs(this._data));
                    console.log('restored:', this._data, this._i);
                }
            }
            return id ? this._data[this.getPk(id)] : this._data;
        },
        delete: function(id){
            delete this._data[this.getPk(id)];
            this.update();
            return this;
        },
        add: function(obj){
            this._i++;
            this._data[this.getPk(this._i)] = angular.extend(obj, {id:this._i});
            this.update();
            return this._i;
        },
    }

    var route = {

        findAll: function () {
            var scope = this;
            var deferred = $q.defer();
            //var routes = [];

            deferred.resolve(storage.data());

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

            deferred.resolve(storage.data(id));

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