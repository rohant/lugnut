
angular.module('app.services')

.factory('AuthService', function ($q, $log, ApiService, Client) {

	var _identity;

	var auth = {
		
		login: function (data) {
			return ApiService.post('client/login', data).then(function (response) {
				$log.debug('Login..', response);

				if (response.status != 200)
					return $q.reject(response.errors);

				return auth
					.setIdentity(response.identity)
					.getIdentity();
			});
		},
		
		logout: function () {
			return ApiService.get('client/logout').then(function (response) {
				$log.debug('Logout..', response);
				_identity = null;
				return response;
			});
		},
		
		refrash: function () {
			return ApiService.get('client/me').then(function (response) {
				$log.debug('Refrash..', response);
				
				return auth
					.setIdentity(response.identity)
					.getIdentity();
			});
		},
		
		isLoggedIn: function () {
			return !(!_identity || !_identity.id);
		},
		
		setIdentity: function (data) {
			_identity = !data ? null : Client.createEmpty(data);
			return this;
		},
		
		getIdentity: function () {
			return _identity;
		}
	};
	
	return auth;
});
