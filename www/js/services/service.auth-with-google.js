
angular.module('app.services')

.factory('GoogleOAuthService', function ($q, $log, Client, $sim) {

	var auth = {
            
        /**
         * 
         * @return {undefined}
         */
		signIn: function () {
            
            var deferred = $q.defer();

            /**
             * 
             * @param {Object} userData
             * @return {undefined}
             */
            var setIdentity = function(userData)
            {
                console.log(userData);

                var client = Client.createEmpty();

                client.setData({

                    // todo:
                    id: userData.userId,
                    device_id: window.device.uuid,

                    soc_id: userData.userId,
                    soc_provider: Client.availableServices.GOOGLE_PLUS,
                    soc_access_token: userData.accessToken,

                    email: userData.email,
                    first_name: userData.givenName,
                    last_name: userData.familyName,
                    imageUrl: userData.imageUrl,

                    // todo:
                    password: 12345,
                });

                $sim.getInfo().then(function(simData, error){

                    if (!error) {
                        client.phone = simData.phoneNumber;
                    }

                    client.save().then(function (client) {

                        if (!client.hasErrors()) {
                            deferred.resolve(client);
                        }

                    }).catch(function (error) {
                        deferred.reject(error);
                    });                
                });
            }
            
            try {
                
                window.plugins.googleplus.trySilentLogin({}, setIdentity, function (error) {
                    console.log('googleplus.trySilentLogin: ', error);
                    
                    window.plugins.googleplus.login({}, setIdentity, function (error) {
                        deferred.reject(error);
                        console.log('googleplus.login: ', error);
                    });
                });

            } catch (e) {
                console.log(e)
            }
            
            return deferred.promise;
		},
        
        /**
         * 
         * @return {unresolved}
         */
        signUp: function () {
            
            // todo:
            return auth.signIn();
		},
		
        /**
         * 
         * @return {unresolved}
         */
		logout: function () {
            
            var deferred = $q.defer();
            
            try {
                window.plugins.googleplus.logout(function (message) {
                    deferred.resolve(message);
                });

                //window.plugins.googleplus.disconnect(function (message) {
                //    console.log('googleplus.disconnect',message); // do something useful instead of alerting
                //});

            } catch (e) {
                deferred.reject(e);
            }
            
            return deferred.promise;
		},
	};
	
	return auth;
});
