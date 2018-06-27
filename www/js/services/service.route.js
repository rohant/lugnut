angular.module('app.services')

.factory('Route', function ($injector, $log, $q, ApiService) {

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
     * The Ramer Douglas Peucker path simplification
     * 
     * @param {Float} tolerance
     * @return {Array}
     */
    RouteModel.prototype.simplify = function (tolerance) {
        
        var simplified = simplifyLine(this.points.map(function(o){
            return Object.values(o);
        }), tolerance || 0.00015).map(function(i){
            return new google.maps.LatLng(i[0],i[1])
        });
        
        $log.info('Points length:', this.points.length);
        $log.info('Points length after simplified:', simplified.length);
        
        return simplified;
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
    
    //RouteModel.prototype.validate = function () {}

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
                return $q.reject($self.errors);
			}
            
            return $self;
            
        }).catch(function(errors){
            
            if (errors.hasOwnProperty('status')){
                //$self.errors['_internal_'] = errors;
                
                if (errors.status == -1) {
                    $self.errors['_internal_'] = 'Internet connection error. Please try again later.';
                    
                }else if (200 <= errors.status){
                    $self.errors['_internal_'] = 'Internal server error. Please try again later.';
                }
            }
            return $q.reject(errors);
		});
    };
    
    /**
     * 
     * @param {Integer} index
     * @return {google.maps.LatLng}
     */
    RouteModel.prototype.getLatLngPoint = function (index) {
        
        if (index < 0) {
            index = this.points.length + index;
        }
        return new google.maps.LatLng(
            this.points[index].lat,
            this.points[index].lng
        );
    };
    
    /**
     * 
     * @return {Array}
     */
    RouteModel.prototype.getLatLngPoints = function () {
        var tmp = [];
        for (var i in this.points) {
            tmp.push(this.getLatLngPoint(i));
        }
        return tmp;
    };

    /**
     * Returns the url of static image
     * 
     * @return {string}
     */
    RouteModel.prototype.getImageUrl = function (options) {
        
        if (!this.imageUrl) {
            
            var path = [], gsm = $injector.get('GoogleStaticMap');
            var points = this.simplify(0.0015);

            for (var i in points) {
                path.push([
                    points[i].lat().toFixed(6), 
                    points[i].lng().toFixed(6)
                ].join(','));
            }
            
            if (!options) options = {};
            
            options['path'] = path;
            
            if (!options['size'])
                options['size'] = '500x300';
            
            options['markers'] = [
                ['color:blue','label:A', path[0]].join('|'),
                ['color:red','label:B', path[path.length-1]].join('|'),
            ];
            
            this.imageUrl = gsm.makeImg(options);
        }
        return this.imageUrl;
    };

    
    /**
     * 
     * @return {Object}
     */
    RouteModel.prototype.relations = function () {
        return {
            
            // HAS_ONE relations
            
            /**
             * Returns the Client model 
             * 
             * @return {unresolved}
             */
            user: function() {
                var Client = $injector.get('Client');              
                return Client.findOne(this.user_id);
            }
        };
    };
    
    /**
     * Greedy data loading
     * 
     * @param {array|string} relations Relations names (separated ","). If "*" then will be loaded all related data.
     * @return {self}
     */
    RouteModel.prototype.with = function (relations) 
    {
        var self = this;
        
        if (angular.isFunction(this.relations))
        {
            self._related = {};
            
            var promises = [];
            var _relations = this.relations();
            
            if (angular.isString(relations)) {
                if (relations != '*') {
                    relations = relations.split(',');
                } else {
                    relations = Object.keys(_relations);
                }
            }
            
            for (var i in relations) {
                var rel = relations[i];
                
                if (!angular.isFunction(_relations[rel])) {
                    throw Error('Relation ' + _relations[rel] + ' is wrong!');
                } else {
                    promises.push(_relations[rel].apply(self).then(function(data){
                        //self._related[rel] = data;
                        self[rel] = data;
                    }));
                }
            }
            
            $q.all(promises).then(function(){
                console.log('related loaded!');
            });
        }
        return this;
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