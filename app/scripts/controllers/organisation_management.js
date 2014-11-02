// 'use strict';

angular.module('tkrekryApp')
    .controller('OrganisationManagementCtrl', function($q, $scope, $routeParams, $location, $modal, focus, _, Auth, Organisation, Employer, Contact, Office, User, modalSettings) {
        $q.all({
            employers: Employer.list().$promise,
            users: User.list().$promise,
            offices: Office.list().$promise,
            contacts: Contact.list().$promise,
            domains: Organisation.domains().$promise,
            districts: Organisation.districts().$promise,
        }).then(function(promises) {
            $scope.domains = promises.domains;
            $scope.districts = promises.districts;
            $scope.allDistricts = $scope.districts;

            $scope.contacts = promises.contacts;
            $scope.offices = promises.offices;
            $scope.users = promises.users;

            $scope.selectedEmployer = promises.employers[0];
            $scope.employers = promises.employers;

            $scope.employerContacts = _.filter($scope.contacts, {
                employer: promises.employers[0]._id
            });

            $scope.employerOffices = _.filter($scope.offices, {
                employer: promises.employers[0]._id
            });
        });

        $scope.domainFilter = function(val) {
            if ($scope.employerDomain && $scope.employerDomain.id == val.domain_id)
                return val;
        };

        $scope.selecteEmployer = function() {
            $scope.employer = $scope.selectedEmployer;

            $scope.employerUsers = _.sortBy(_.map(_.filter($scope.users, function(user) {
                return _(user.employers).contains($scope.employer._id);
            }), function(user) {
                user.list_name = [user.last_name, user.first_name].join(', ');
                return user;
            }), ['list_name']);

            $scope.availableUsers = _.sortBy(_.map(_.reject($scope.users, function(user) {
                return _($scope.employerUsers).contains(user);
            }), function(user) {
                user.list_name = [user.last_name, user.first_name].join(', ');
                return user;
            }), ['list_name']);

            $scope.employerDistrict = _.find($scope.districts, {name: $scope.employer.district.name});
            $scope.employerDomain = _.find($scope.domains, {name: $scope.employer.domain.name});
        };

        $scope.update = function() {
            $scope.employer.users = $scope.employerUsers;
            $scope.employer.domain = _.find($scope.domains, {name: $scope.employerDomain.name});
            $scope.employer.district = _.find($scope.districts, {name: $scope.employerDistrict.name});

            Employer.update({
                id: $scope.employer._id
            }, $scope.employer, function(employer) {
                $scope.employer = employer;
                $modal.open({
                    templateUrl: 'employer/modals/saved.html',
                    controller: function($scope, $modalInstance, $timeout) {
                        var promise = $timeout(function() {
                            $modalInstance.close('close');
                        }, modalSettings.timeout);

                        $scope.ok = function() {
                            $timeout.cancel(promise);
                            $modalInstance.close('close');
                        }
                    }
                });

                $scope.employerDistrict = _.find($scope.districts, {name: $scope.employer.district.name});
                $scope.employerDomain = _.find($scope.domains, {name: $scope.employer.domain.name});
                $scope.employers = Employer.list();
            });
        };
    });