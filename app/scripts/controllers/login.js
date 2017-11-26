angular.module('tkrekryApp')
  .controller('LoginController', function ($scope, Auth, $location, tbkKeenClient) {
    'use strict';
    $scope.user = {email: "", password: ""};
    $scope.errors = {};

    $scope.login = function(form) {
      $scope.submitted = true;

      if(form.$valid) {
        Auth.login({
          email: $scope.user.email,
          password: $scope.user.password
        }).then( function() {
          var loginEvent = {
            email: $scope.user.email,
            login_success: true,
            keen: {
              timestamp: new Date().toISOString()
            }
          };
          tbkKeenClient.addEvent('logins', loginEvent);

          // Logged in, redirect to home
          $location.path('/');
        })["catch"]( function(err) {
          var loginEvent = {
            email: $scope.user.email,
            login_success: false,
            keen: {
              timestamp: new Date().toISOString()
            }
          };
          tbkKeenClient.addEvent('logins', loginEvent);

          err = err.data;
          $scope.errors.other = err.message;
        });
      }
    };
  });
