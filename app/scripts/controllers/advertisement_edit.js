angular.module('tkrekryApp')
    .controller('AdvertisementEditController', function($q, $log, $rootScope, $anchorScroll, $scope, $routeParams, $location, $window, $timeout, $modal, $route, focus, _, Auth, Organisation, Advertisement, Employer, Contact, Office, modalSettings) {
        'use strict';

        $scope.submitted = false;
        $scope.showErrors = false;
        $scope.selectedOffice = {};
        $scope.selectedEmployer = null;

        $scope.editorOptions = {
            language: 'fi',
            customConfig: '',
            stylesSet: false,
            toolbarGroups: [],
            toolbar: [],
            height: "200px",
            width: "100%"
        };

        var defaultAdvertisement = {
            application_period_end_date: null, //$window.moment().format("DD.MM.YYYY"),
            application_period_end_time: null, //$window.moment().format("HH:mm"),
            description: '',
            publication_day: null
        };

        var newAdvertisementPromise = $q.defer();
        newAdvertisementPromise.resolve(defaultAdvertisement);

        var advertisemetPromise = $routeParams.id ? Advertisement.show({
            id: $routeParams.id
        }).$promise : newAdvertisementPromise.promise;

        $q.all({
            advertisement: advertisemetPromise,
            jobTypes: Organisation.jobTypes().$promise,
            jobProfessionGroups: Organisation.jobProfessionGroups().$promise,
            jobDurations: Organisation.jobDurations().$promise,
            contacts: Contact.list().$promise,
            offices: Office.list().$promise,
            employers: Employer.list().$promise
        }).then(function(promises) {

            $scope.jobTypes = promises.jobTypes;
            $scope.jobProfessionGroups = promises.jobProfessionGroups;
            $scope.jobDurations = promises.jobDurations;
            $scope.contacts = promises.contacts;
            $scope.offices = promises.offices;
            $scope.employers = promises.employers;
            $scope.advertisement = promises.advertisement;

            if ($scope.advertisement.employer) {
                $scope.selectedEmployer = _($scope.employers).find({
                    _id: $scope.advertisement.employer
                });
            } else {
                $scope.selectedEmployer = _.head($scope.employers);
            }

            $scope.advertisement.application_period_end_date = ($scope.advertisement.application_period_end ? $window.moment($scope.advertisement.application_period_end)
                .format("DD.MM.YYYY") : null);

            $scope.advertisement.application_period_end_time = ($scope.advertisement.application_period_end ? $window.moment($scope.advertisement.application_period_end)
                .format("HH:mm") : null);

            $scope.advertisement.application_placed_on = $window.moment($scope.advertisement.application_placed_on)
                .format("DD.MM.YYYY");
            $scope.advertisement.publication_day = $window.moment($scope.advertisement.publication_day).isValid() ? $window.moment($scope.advertisement.publication_day)
                .format("DD.MM.YYYY") : null;
        });

        $scope.$watch('selectedEmployer', function(newEmployer, oldEmployer) {
            if (oldEmployer) {
                $scope.advertisement.contacts = [];
                $scope.advertisement.office = {};
            }
        });

        $scope.bySelectedEmployer = function(item) {
            return $scope.selectedEmployer && $scope.selectedEmployer._id === item.employer;
        };

        $scope.addContact = function(contact) {
            if (contact) {
                if ((_($scope.advertisement.contacts).contains(contact)) === false) {
                    var new_contact = angular.copy(contact);
                    new_contact._id = Math.random().toString(36).substring(6);

                    if ($scope.advertisement.contacts) {
                        $scope.advertisement.contacts.push(new_contact);
                    } else {
                        $scope.advertisement.contacts = [new_contact];
                    }
                }
            } else {
                if (!_.isArray($scope.advertisement.contacts)) {
                    $scope.advertisement.contacts = [];
                }

                $scope.advertisement.contacts.push({
                    _id: Math.random().toString(36).substring(6)
                });
            }
        };

        $scope.fillOffice = function(office) {
            $scope.advertisement.office = angular.copy(office);
        };

        $scope.fullname = function(contact) {
            return [contact.title, contact.first_name, contact.last_name].join(" ");
        };

        $scope.removeContact = function(contact) {
            $scope.advertisement.contacts = _.without($scope.advertisement.contacts, contact);
        };

        $scope.toggle = function() {
            if ($scope.advertisement.published) {
                Advertisement.unpublish({
                    id: $scope.advertisement._id
                }, function() {
                    $modal.open({
                        templateUrl: 'advertisement/modals/unpublished.html',
                        controller: function($scope, $modalInstance, $timeout) {
                            var promise = $timeout(function() {
                                $modalInstance.close('close');
                            }, modalSettings.timeout);

                            $scope.ok = function() {
                                $timeout.cancel(promise);
                                $modalInstance.close('close');
                            };
                        }
                    });
                    $route.reload();
                    focus('button-group');

                });
            } else {
                Advertisement.publish({
                    id: $scope.advertisement._id
                }, function() {
                    $modal.open({
                        templateUrl: 'advertisement/modals/published.html',
                        controller: function($scope, $modalInstance, $timeout) {
                            var promise = $timeout(function() {
                                $modalInstance.close('close');
                            }, modalSettings.timeout);

                            $scope.ok = function() {
                                $timeout.cancel(promise);
                                $modalInstance.close('close');
                            };
                        }
                    });
                    $route.reload();
                    focus('button-group');
                });
            }
        };

        $scope.copy = function() {
            $location.path('/advertisements/copy/' + $scope.advertisement._id);
        };

        $scope.toggleText = function() {
            return $scope.advertisement.published ? 'Piilota' : 'Julkaise';
        };

        $scope.preview = function() {
            $scope.advertisementForPreview = angular.copy($scope.advertisement);
            $scope.advertisementForPreview.application_period_end = $window.moment([$scope.advertisementForPreview.application_period_end_date, $scope.advertisementForPreview.application_period_end_time].join('-'), "DD.MM.YYYY-HH:mm");

            var modalInstance = $modal.open({
                templateUrl: 'advertisement/modals/preview.html',
                controller: function($scope, $modalInstance, advertisement) {
                    $scope.advertisement = advertisement;

                    $scope.ok = function() {
                        $modalInstance.close($scope.advertisement);
                    };

                    $scope.cancel = function() {
                        $modalInstance.dismiss('cancel');
                    };
                },
                resolve: {
                    advertisement: function() {
                        return $scope.advertisementForPreview;
                    }
                }
            });
        };

        $scope.submit = function() {
            var advertisementFromForm = angular.copy($scope.advertisement);
            $scope.submitted = true;
            $scope.showErrors = false;

            if ($scope.advertisementForm.$invalid) {
                $scope.showErrors = true;
                focus('errorsList');
                var modalInstance = $modal.open({
                    templateUrl: 'advertisement/modals/error.html',
                    controller: function($scope, $modalInstance, $timeout, advertisement) {
                        $scope.advertisement = advertisement;

                        $scope.ok = function() {
                            $modalInstance.close($scope.advertisement);
                        };

                        $scope.cancel = function() {
                            $modalInstance.dismiss('cancel');
                        };
                    },
                    resolve: {
                        advertisement: function() {
                            return $scope.advertisementFromForm;
                        }
                    }
                });
                return;
            }

            advertisementFromForm.employer = $scope.selectedEmployer._id;

            advertisementFromForm.contacts = _.map(advertisementFromForm.contacts, function(contact) {
                return _(contact)
                    .pick(["_id", "title", "email", "phone", "employer", "first_name", "last_name"])
                    .value();
            });

            advertisementFromForm.application_period_end = ($window.moment([advertisementFromForm.application_period_end_date, advertisementFromForm.application_period_end_time].join('-'), "DD.MM.YYYY-HH:mm")).format();
            if (advertisementFromForm.application_period_end === "Invalid date") {
              delete advertisementFromForm.application_period_end;
            }

            delete advertisementFromForm.application_period_end_time;
            delete advertisementFromForm.application_period_end_date;

            advertisementFromForm.publication_day = (advertisementFromForm.publication_day ? $window.moment(advertisementFromForm.publication_day, "DD.MM.YYYY") : null);
            advertisementFromForm.application_placed_on = $window.moment(advertisementFromForm.application_placed_on, "DD.MM.YYYY");

            if ($scope.advertisement._id) {
                Advertisement.update({
                        id: $scope.advertisement._id
                    },
                    advertisementFromForm,
                    function(err, updated) {
                        var modalInstance = $modal.open({
                            templateUrl: 'advertisement/modals/saved.html',
                            controller: function($scope, $modalInstance, $timeout) {
                                var closeTimeout = $timeout(function() {
                                    $modalInstance.close();
                                }, modalSettings.timeout);

                                $scope.ok = function() {
                                    $timeout.cancel(closeTimeout);
                                    $modalInstance.close('closed');
                                };
                            }
                        });
                    });


            } else {
                var newAdvertisement = new Advertisement(advertisementFromForm);
                newAdvertisement.$save(function(savedAdvertisement) {
                    $location.path('/advertisements/edit/' + savedAdvertisement._id);
                    var modalInstance = $modal.open({
                        templateUrl: 'advertisement/modals/saved.html',
                        controller: function($scope, $modalInstance, $timeout) {
                            var closeTimeout = $timeout(function() {
                                $modalInstance.close();
                            }, modalSettings.timeout);

                            $scope.ok = function() {
                                $timeout.cancel(closeTimeout);
                                $modalInstance.close('closed');
                            };
                        }
                    });
                });
            }
        };
    });
