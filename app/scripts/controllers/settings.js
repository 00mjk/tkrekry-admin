angular.module( 'tkrekryApp' )
  .controller( 'SettingsController', function ( $scope, $routeParams, $timeout, $modal, $q, $location, User, Auth, Employer, _, modalSettings ) {
    'use strict';

    $scope.errors = {};
    var userId = $routeParams.userId;

    $scope.updateSettingsDetails = function() {
      $q.all( {
          employers: Employer.list().$promise,
          users: User.list().$promise,
          currentUser: Auth.currentUser().$promise
        } )
        .then( function ( promises ) {
          $scope.user = null;
          $scope.allEmployers = promises.employers;
          $scope.allUsers = promises.users;
          $scope.currentUser = promises.currentUser;

          if (userId && $scope.currentUser.role === 'admin') {
            $scope.user = _.find($scope.allUsers, {'id': userId});
          }

          $scope.user = angular.copy($scope.user || promises.currentUser);
          $scope.selectedUser = $scope.user;

          var employerIds = $scope.user.employers;
          $scope.user.employers = _.sortBy( _.filter( $scope.allEmployers, function ( employer ) {
            return _.contains( employerIds, employer._id );
          } ), [ 'name' ] );
        } );
    };

    $scope.updateSettingsDetails();

    $scope.changeUser = function ( user ) {
      $scope.userSettingsURL = '/' + ['settings', (user._id || user.id)].join('/');
      $location.path($scope.userSettingsURL);
    };

    $scope.remove = function () {
      var confirmModalInstance = $modal.open( {
        templateUrl: 'settings/modals/confirm.html',
        controller: function ( $scope, $modalInstance, $timeout, user) {
          $scope.user = user;
          $scope.confirmRemove = function() {
              $modalInstance.close('yes');
          };

          $scope.unConfirmRemove = function() {
              $modalInstance.dismiss('cancel');
          };
        },
        resolve: {
            user: function() {
                return $scope.user;
            }
        }
      });

      confirmModalInstance.result.then(function() {
        User.destroy( {id: $scope.user.id} )
          .$promise
          .then( function () {
            $scope.allUsers = User.list();
            $scope.changeUser($scope.currentUser);

            var modalInstance = $modal.open({
              templateUrl: 'settings/modals/removed.html',
              controller: function ( $scope, $modalInstance, $timeout) {
                $scope.user = user;

                var promise = $timeout(function() {
                    $modalInstance.close();
                }, modalSettings.timeout);

                $scope.ok = function() {
                    $timeout.cancel(promise);
                    $modalInstance.close('close');
                };
              }
            });
          });
      });
    };

    $scope.update = function ( form ) {
      $scope.submitted = true;

      if ( form.$valid ) {
        var userFromForm = angular.copy( $scope.user );

        User.update( { id: ($scope.user._id || $scope.user.id) }, $scope.user )
          .$promise
          .then( function () {
            form.$setPristine();

            $scope.user.current_password = '';
            $scope.user.new_password = '';
            $scope.allUsers = User.list();

            var modalInstance = $modal.open( {
              templateUrl: 'settings/modals/saved.html',
              controller: function ( $scope, $modalInstance, $timeout ) {
                var closeTimeout = $timeout( function () {
                  $modalInstance.close();
                }, modalSettings.timeout );

                $scope.ok = function () {
                  $timeout.cancel( closeTimeout );
                  $modalInstance.close( 'closed' );
                };
              }
            } );
          } )["catch"]( function () {
            $scope.user.current_password = '';
            $scope.user.new_password = '';

            form.password.$setValidity( 'mongoose', false );
            $scope.errors.other = 'Incorrect password';
          } );
      }
    };
  } );
