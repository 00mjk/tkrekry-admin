angular.module( 'tkrekryApp' )
  .controller( 'UserNewController', function( $q, $log, $rootScope,
        $anchorScroll, $scope, $routeParams, $location, $window, $timeout,
        $modal, $route, focus, _, Auth, Organisation, Advertisement,
        Employer, Contact, Office, User, modalSettings ) {
    'use strict';

    var employerId = $routeParams.employerId;
    $scope.usedEmails = [];
    $scope.newUser = new User();
    $scope.newUser.employers = [];

    $q.all( {
      employers: Employer.list().$promise,
      users: User.list().$promise,
    } )
      .then( function ( promises ) {
        $scope.allEmployers = promises.employers;
        $scope.usedEmails = _.map(promises.users, 'email');

        var foundEmployer = _.find( $scope.allEmployers, { _id: employerId } );
        $scope.newUser.employers = (foundEmployer ? [foundEmployer] : []);
      } );

    $scope.validateEmailUniq = function (value) {
      return $scope.usedEmails.indexOf(value) === -1;
    };

    $scope.save = function (userForm) {
      $scope.newUser.employers = _.map($scope.newUser.employers, '_id');
      $scope.newUser.$save( function ( err, user ) {
        $modal.open( {
          templateUrl: 'user/modals/created.html',
          controller: function ( $scope, $modalInstance, $timeout ) {
            var promise = $timeout( function () {
              $modalInstance.close();
            }, modalSettings.timeout );

            $scope.ok = function () {
              $timeout.cancel( promise );
              $modalInstance.close( 'close' );
            };
          }
        } );
        $location.path('/settings/self');
      } );
    };
});
