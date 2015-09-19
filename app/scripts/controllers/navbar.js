angular.module('tkrekryApp')
  .controller('NavbarController', function ($scope, $location, Auth, Employer) {
    'use strict';

    $scope.menu = [
      {
        'title': 'Työpaikkailmoitukset',
        'link': '/',
        'show': ['user', 'admin']
      },
      {
        'title': 'Terveyskeskuksen tiedot',
        'link': '/employer/select',
        'show': ['user', 'admin']
      },
      {
        'title': 'Omat tiedot',
        'link': '/settings/self',
        'show': ['user', 'admin']
      },
      {
        'title': 'Organisaatiohallinta',
        'link': '/organisation',
        'show': ['admin']
      },
      {
        'title': 'Ohjeet',
        'link': '/help',
        'show': ['user', 'admin']
      }
    ];

    $scope.logout = function() {
      Auth.logout()
        .then(function() {
          $location.path('/login');
          return false;
        }, function(err) {
          return false;
      });
    };

    $scope.isActive = function(route) {
      return route === $location.path();
    };
  });
