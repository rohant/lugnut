
angular.module('app.services')

// The Client model
.factory('Client', function ($q, $log, ApiService) {
	
    var services = {
        GOOGLE_PLUS: 1,
        // other..
    };
    
	var Client = function (data) {
        
        this.availableServices = services;
        
        this.errors = {};
        
		this.attributes = [
			'id',
			'device_id',
			'soc_id',
			'soc_provider',
			'soc_access_token',
			'routesCount',
			'first_name',
			'last_name',
			'phone',
			'email',
			'password',
		];
        
		data && this.setData(data);
	};
	
	/**
	 * 
	 * @param {object} data
	 * @returns {Client.prototype}
	 */
	Client.prototype.setData = function (data) {
		angular.extend(this, data);
		return this;
	};
	
	/**
	 * 
	 * @returns {boolean}
	 */
	Client.prototype.isNewRecord = function () {
		return this.hasOwnProperty('id') && !!this.id;
	};
	
	/**
	 * 
	 * @returns {string}
	 */
	Client.prototype.getImageUrl = function (defaultImageUrl) {
        
		if (this.hasOwnProperty('imageUrl'))
            return this.imageUrl;
        
        return defaultImageUrl 
            ? defaultImageUrl 
            : './img/avatar/no.s.jpg';
	};
	
	/**
	 * 
	 * @returns {array}
	 */
	Client.prototype.getAttributes = function () {
		var $self = this, data = {};
		
		$self.attributes.map(function(el){
			data[el] = $self[el]
		});
        
		return data;
	};
    
	/**
	 * 
	 * @returns {boolean}
	 */
	Client.prototype.unsetAttributes = function (attributes) {
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
	Client.prototype.hasErrors = function () {
		return Object.keys(this.errors).length;
	};
	
	/**
	 * 
	 * @returns {unresolved}
	 */
	Client.prototype.save = function () {
		var $self = this;
		var data = $self.getAttributes();
        
        $self.errors = {};
		
		return ApiService.post('client/create', data).then(function(response){
			$log.debug('Create..', response);

			if (response.identity) {
				//$self.id = response.identity.id;
				angular.extend($self, response.identity);
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
	 */
	Client.prototype.update = function () {
        return this.save();
	};
	
	var client = {
        
        availableServices: services,
		
		findAll: function () {
			// do something
		},
		
		findOne: function (id) {
			// do something
		},
		
		createEmpty: function (data) {
			return new Client(data);
		}
	};

	return client;
});