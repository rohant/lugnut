
angular.module('app.services')

// The Client model
.factory('Client', function ($q, $log, ApiService) {
	
	var Client = function (data) {
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
	 * @returns {array}
	 */
	Client.prototype.getAttributes = function () {
		var $self = this, data = {};
		
		var _attributes = [
			'id',
			'name',
			'phone',
			'email',
			'password',
		];
		
		_attributes.map(function(el){
			data[el] = $self[el]
		});
		return data;
	};
	
	/**
	 * 
	 * @returns {unresolved}
	 */
	Client.prototype.save = function () {
		var $self = this;
		var data = $self.getAttributes();
		
		return ApiService.post('client/create', data).then(function(response){
			$log.debug('Create..', response);

			if (response.identity) {
				$self.id = response.identity.id;
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
		// do something
	};
	
	var client = {
		
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