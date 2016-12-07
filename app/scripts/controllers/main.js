// http://lorenzofox3.github.io/smart-table-website/

angular.module('tkrekryApp')
    .controller('MainController', function ($q, $scope, $http, $modal, Auth, Advertisement, Organisation, Employer, User, _) {
        'use strict';

        $q.all({
            advertisements: Advertisement.list().$promise,
            employers: Employer.list().$promise,
            currentUser: Auth.currentUser().$promise,
            domains: Organisation.domains().$promise,
            districts: Organisation.districts().$promise,
            users: User.list().$promise
        }).then(function (promises) {
            $scope.advetisements = promises.advertisements;
            $scope.allAdvetisements = promises.advertisements;
            $scope.domains = promises.domains;
            $scope.districts = promises.districts;
            $scope.employers = promises.employers;
            $scope.currentUser = promises.currentUser;
            $scope.latestEmployer = _.chain(promises.employers).sortBy('updated_at').last().value();
            $scope.users = promises.users;
        });

        $scope.filterAdvertisements = function () {
            if ($scope.selectedEmployer) {
                $scope.advetisements = _.filter($scope.allAdvetisements, function (advertisement) {
                    return advertisement.employer._id === $scope.selectedEmployer;
                });
            } else {
                $scope.advetisements = angular.copy($scope.allAdvetisements);
            }
        };
    });
