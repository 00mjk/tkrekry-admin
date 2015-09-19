angular.module('tkrekryApp')
    .controller('EmployerSelectController', function($q, $scope, $routeParams, $location, $modal, focus, _, Auth, Organisation, Employer, Contact, Office, User, modalSettings) {
        'use strict';
        $scope.employerUrl = '/' + ['employers', 'edit', $scope.currentUser.employers[0]].join('/');
        $location.path($scope.employerUrl);
    });
