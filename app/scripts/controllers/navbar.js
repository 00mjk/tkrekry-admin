// 'use strict';

angular.module('tkrekryApp')
  .controller('NavbarCtrl', function ($scope, $location, Auth) {
    $scope.menu = [
      {
        'title': 'Työpaikkailmoitukset',
        'link': '/',
        'show': ['user', 'admin']
      },
      {
        'title': 'Terveyskeskuksen tiedot',
        'link': '/employer/edit',
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
      });
    };

    $scope.isActive = function(route) {
      return route === $location.path();
    };
  });
