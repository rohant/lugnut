angular.module('app.services')

.factory('Route', function ($injector, $log, $http, $q, ApiService, Config) {

    var RouteModel = function(data){
        this.id = null;
        this.errors = {};
        this.points = [];
        
		this.attributes = [
			'id',
			'user_id',
			'title',
			'city',
			'address',
			'description',
			'points',
		];
        
        if (data) {
            this.setData(data);
        }
    };

    RouteModel.prototype.setData = function (data) {
        angular.extend(this, data);
    };
    
	/**
	 * 
	 * @returns {boolean}
	 */
	RouteModel.prototype.isNewRecord = function () {
		return this.hasOwnProperty('id') && !!this.id;
	};
	
	/**
	 * 
	 * @returns {array}
	 */
	RouteModel.prototype.getAttributes = function () {
		var $self = this, data = {};
		
		$self.attributes.map(function(el){
			data[el] = $self[el];
		});
        
		return data;
	};
    
	/**
	 * 
	 * @returns {boolean}
	 */
	RouteModel.prototype.unsetAttributes = function (attributes) {
		var $self = this;
		
		(attributes || $self.attributes).map(function(el){
			$self[el] = null;
		});
        
		return $self;
	};
    
	/**
	 * 
	 * @returns {int}
	 */
	RouteModel.prototype.hasErrors = function () {
		return Object.keys(this.errors).length;
	};
    
    /**
     * 
     * @param {object} point
     * @return {RouteModel}
     */
    RouteModel.prototype.addPoint = function (point) {
        if (angular.isArray(this.points))
            this.points.push(point);
        return this;
    };
    
    /**
     * 
     * @return {Boolean}
     */
    RouteModel.prototype.delete = function () {
        console.log('RouteModel:delete')
        //storage.delete(this.id);
        
        return ApiService.get('route/delete?id='+this.id).then(function (response) {
            console.log('delete', response)
            return response;
        });
        
        return true;
    };

    /**
     * 
     * @return {unresolved}
     */
    RouteModel.prototype.save = function () {
        var $self = this;
        
        $self.errors = {};
        $self.created = new Date().getTime();
        var data = $self.getAttributes();
        
        console.log('RouteModel:save')
        
        //return storage.add(this);
        
        return ApiService.post('route/create', data).then(function (response) {
            console.log('save', response)
            
			if (response.model) {
				$self.id = response.model.id;
			}
			
			if (response.errors) {
				$self.errors = response.errors;
			}
            
            return $self;
            
        }).catch(function(errors){
			$self.errors = errors;
		});
    };
    
    /**
     * 
     * @return {Array}
     */
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

    /*var storage = {
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
    }*/

    var route = {

        findAll: function (criteria) {
            //var scope = this;
            //var deferred = $q.defer();
            //deferred.resolve(storage.data());
            //return deferred.promise;

            return ApiService.get('route/list', criteria).then(function (data) {
                var routes = [];
                
                data.models.forEach(function (data) {
                    routes.push(new RouteModel(data));
                });
                
                return routes;
            });
        },
        
        findOne: function (id) {
            //var scope = this;
            //var deferred = $q.defer();
            //deferred.resolve(storage.data(id));
            //return deferred.promise;

            return ApiService.get('route/view?id=' + id).then(function (data) {
                return new RouteModel(data.model);
            });
        },

        createEmpty: function (data) {
            return new RouteModel(data);
        }
    };

    return route;
})