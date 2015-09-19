angular.module('tkrekryApp')
  .controller('LoginController', function ($scope, Auth, $location) {
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
          // Logged in, redirect to home
          $location.path('/');
        })["catch"]( function(err) {
          err = err.data;
          $scope.errors.other = err.message;
        });
      }
    };
  });