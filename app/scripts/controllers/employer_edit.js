// 'use strict';

angular.module('tkrekryApp')
    .controller('EmployerEditCtrl', function($q, $scope, $routeParams, $location, $modal, focus, _, Auth, Organisation, Employer, Contact, Office, User, modalSettings) {
        $scope.submitted = false;
        $scope.showErrors = false;
        $scope.errors = {};
        $scope.employer = {};
        $scope.employerUsers = [];
        $scope.availableUsers = [];

        $scope.editorOptions = {
            language: 'fi',
            customConfig: '',
            stylesSet: false,
            toolbarGroups: [],
            toolbar: [],
            height: "200px",
            width: "100%"
        };

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
            $scope.employer = promises.employers[0];

            $scope.employers = promises.employers;

            $scope.employerContacts = _.filter($scope.contacts, {
                employer: promises.employers[0]._id
            });
            $scope.employerOffices = _.filter($scope.offices, {
                employer: promises.employers[0]._id
            });

            $scope.employerUsers = _.sortBy(_.map(_.filter($scope.users, function(user) {
                return _(user.employers).contains(promises.employers[0]._id);
            }), function(user) {
                return user;
            }), ['full_name']);

            $scope.availableUsers = _.sortBy(_.map(_.reject($scope.users, function(user) {
                return _($scope.employerUsers).contains(user);
            }), function(user) {
                return user;
            }), ['full_name']);
        });

        $scope.nameList = function(user) {
            return [user.last_name, user.first_name].join(', ');
        };

        $scope.selecteEmployer = function() {
            User.list().$promise.then(function(users) {
                $scope.users = users;
                $scope.employer = $scope.selectedEmployer;
                $scope.employerContacts = _.filter($scope.contacts, {
                    employer: $scope.employer._id
                });
                $scope.employerOffices = _.filter($scope.offices, {
                    employer: $scope.employer._id
                });

                $scope.employerUsers = _.filter($scope.users, function(user) {
                    return _(user.employers).contains($scope.employer._id);
                });

                $scope.availableUsers = _.reject($scope.users, function(user) {
                    return _($scope.employerUsers).contains(user);
                });
            });
        };

        $scope.domainChanged = function(selectedDomain) {
            $scope.districts = _.filter($scope.allDistricts, {
                domain_id: selectedDomain.id
            });
        };

        $scope.addContact = function() {
            if (!$scope.employer.contacts) {
                $scope.employer.contacts = [];
            }

            $scope.employer.contacts.push({
                _id: new Date().getTime()
            });
        };

        $scope.removeContact = function(contact) {
            $scope.employer.contacts = _.without($scope.employer.contacts, contact);
        };

        $scope.addOffice = function() {
            if (!$scope.employer.offices) {
                $scope.employer.offices = [];
            }

            $scope.employer.offices.push({
                _id: new Date().getTime()
            });
        };

        $scope.removeOffice = function(office) {
            $scope.employer.offices = _.without($scope.employer.offices, office);
        };

        $scope.submit = function() {
            if ($scope.employerForm.$invalid) {
                $scope.showErrors = true;
                focus('errorsList');
                var modalInstance = $modal.open({
                    templateUrl: 'employer/modals/error.html',
                    controller: function($scope, $modalInstance, $timeout) {
                        $scope.ok = function() {
                            $modalInstance.close();
                        };

                        $scope.cancel = function() {
                            $modalInstance.dismiss('cancel');
                        };
                    }
                });
                return;
            } else {
                $scope.employer.users = $scope.employerUsers;

                Employer.update({
                    id: $scope.employer._id
                }, $scope.employer, function(employer) {
                    $scope.employer = employer;
                    delete $scope.employer.users;
                    $scope.employer.updated_at = new Date();

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

                });
            }
        };

    });
