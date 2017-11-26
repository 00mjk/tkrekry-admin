angular.module('tkrekryApp')
    .controller('EmployerSelectController', function($q, $scope, $routeParams, $location, $modal, focus, _, Auth, Organisation, Employer, Contact, Office, User, modalSettings, tbkKeenClient) {
        'use strict';

        var employerSelectEvent = {
            user: $scope.currentUser,
            selectedEmployer: $scope.currentUser.employers[0],
            keen: {
              timestamp: new Date().toISOString()
            }
          };
          tbkKeenClient.addEvent('employers-select', employerSelectEvent);

        $scope.employerUrl = '/' + ['employers', 'edit', $scope.currentUser.employers[0]].join('/');
        $location.path($scope.employerUrl);
    });
