
angular.module('app.services')

.factory('ApiService', function ($q, $http, Config) {

  var obj = {
      get: function (action, data) {
          data = data || {};

          return $http.get(Config.apiUrl + action + '?' + $.param(data), {
              withCredentials: true,
          }).then(function (response) {
            return response.data;
          });
      },
      post: function (action, data) {
          data = data || {};

          var config = {
              withCredentials: true,
              headers : {
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
              }
          };
          return $http.post(Config.apiUrl + action, $.param(data), config).then(function (response) {
            return response.data;
          });
      }
  };
  return obj;
});