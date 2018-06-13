
/**
 * IMPORTANT: 
 * 
 * This service use the plagin https://github.com/pbakondy/cordova-plugin-sim
 * This plugin will not work in --livereload mode.
 */

angular.module('app.services')

.factory('$sim', function ($q) {
    
    var deffered = $q.defer();

    var obj = {
        
        /**
         * Example: 
         * {
          "carrierName": "Vodafone UA",
          "countryCode": "ua",
          "mcc": "255",
          "mnc": "018",
          "callState": 0,
          "dataActivity": 0,
          "networkType": 13,
          "phoneType": 1,
          "simState": 5,
          "isNetworkRoaming": false,
          "activeSubscriptionInfoCount": 2,
          "activeSubscriptionInfoCountMax": 2,
          "phoneNumber": "+380900000000",
          "deviceId": "868344000000000",
          "deviceSoftwareVersion": "12",
          "simSerialNumber": "8938001800404000000f",
          "subscriberId": "255018040000000",
          "cards": [
            {
              "carrierName": "KYIVSTAR",
              "displayName": "KYIVSTAR",
              "countryCode": "",
              "mcc": 255,
              "mnc": 3,
              "isNetworkRoaming": false,
              "isDataRoaming": false,
              "simSlotIndex": 0,
              "phoneNumber": "",
              "simSerialNumber": "8938003992466000000f",
              "subscriptionId": 2
            },
            {
              "carrierName": "Vodafone UA",
              "displayName": "Vodafone UA",
              "countryCode": "",
              "mcc": 255,
              "mnc": 18,
              "isNetworkRoaming": false,
              "isDataRoaming": false,
              "simSlotIndex": 1,
              "phoneNumber": "+380950000000",
              "simSerialNumber": "8938001800400000000f",
              "subscriptionId": 1
            }
          ]
        }

         */
        data: null,
        
        getInfo: function (callback) {
            
            if (obj.data) {
                deffered.resolve(obj.data);
                
                if (typeof callback == 'function') {
                    callback(obj.data, null);
                }
            } else {
            
                document.addEventListener("deviceready", onDeviceReady, false);

                function errorCallback(error) {
                    deffered.reject(error);
                    
                    if (typeof callback == 'function') {
                        callback(null, error);
                    }
                }

                function successCallback(data) {
                    
                    //console.log('data',JSON.stringify(data, null, 2))
                    deffered.resolve(obj.data = data);
                    
                    if (typeof callback == 'function') {
                        callback(obj.data, null);
                    }
                }

                function onDeviceReady() {
                    window.plugins.sim.hasReadPermission(function(permitted){
                        if (permitted) {
                            window.plugins.sim.getSimInfo(successCallback, errorCallback);
                        } else {
                            window.plugins.sim.requestReadPermission(onDeviceReady, errorCallback);
                        }
                    }, errorCallback);
                }
            }
            
            return deffered.promise;
        },
        
        /**
         * IMPORTANT: the getInfo function must be called first
         * 
         * @return {string}
         */
        getPhoneNumber: function(){
            try { 
                return obj.data.phoneNumber; 
            } catch (e) {}
            return null
        }
    };
    return obj;
});