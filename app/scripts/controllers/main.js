// 'use strict';
// http://lorenzofox3.github.io/smart-table-website/

angular.module('tkrekryApp')
    .controller('MainCtrl', function($q, $scope, $http, $modal, Auth, Advertisement, Organisation, Employer, User, _) {
        $q.all({
            advertisements: Advertisement.list().$promise,
            employers: Employer.list().$promise,
            currentUser: Auth.currentUser().$promise,
            domains: Organisation.domains().$promise,
            districts: Organisation.districts().$promise,
            users: User.list().$promise
        }).then(function(promises) {
            $scope.advetisements = promises.advertisements;
            $scope.allAdvetisements = promises.advertisements;
            $scope.domains = promises.domains;
            $scope.districts = promises.districts;
            $scope.employers = promises.employers;
            $scope.currentUser = promises.currentUser;
            $scope.latestEmployer = _.chain(promises.employers).sortBy('updated_at').last().value();
            $scope.users = promises.users;
        });



        $scope.filterAdvertisements = function() {
            if ($scope.selectedEmployer) {
                $scope.advetisements = _.filter($scope.allAdvetisements, function(advertisement) {
                    return advertisement.employer._id === $scope.selectedEmployer;
                });
            } else {
                $scope.advetisements = $scope.allAdvetisements;
            }
        };

        $scope.columnCollection = [{
            map: 'title',
            label: 'Tehtävä',
            headerClass: "is-sortable",
            isSortable: true
        }, {
            map: 'publication_day',
            label: 'Automaattinen julkaisu pvm.',
            isSortable: true,
            headerClass: "is-sortable",
            cellTemplateUrl: "/partials/smart-table/publication-day-row.html"
        }, {
            map: 'published_at',
            label: 'Julkaistu',
            isSortable: true,
            headerClass: "is-sortable",
            cellTemplateUrl: '/partials/smart-table/publication-day-row.html'
        }, {
            map: 'application_period_end',
            label: 'Haku päättyy',
            isSortable: true,
            headerClass: "is-sortable",
            cellTemplateUrl: '/partials/smart-table/application-period-end-day-row.html'
        }, {
            map: '_id',
            label: ' ',
            isSortable: false,
            cellTemplateUrl: '/partials/smart-table/preview-link-row.html'
        }, {
            map: '_id',
            label: ' ',
            isSortable: false,
            cellTemplateUrl: '/partials/smart-table/edit-link-row.html'
        }, {
            map: '_id',
            label: '',
            isSortable: false,
            cellTemplateUrl: '/partials/smart-table/copy-link-row.html'
        }, {
            map: '_id',
            formatFunction: function(value, foramt) {
                var isPublished = _.find($scope.allAdvetisements, function(advert) {
                    return advert._id === value;
                }).published;

                if (isPublished) {
                    return {
                        url: ['unpublish', value].join('/'),
                        text: 'Piilota'
                    };
                } else {
                    return {
                        url: ['publish', value].join('/'),
                        text: 'Julkaise'
                    };
                }
            },
            label: ' ',
            isSortable: false,
            cellTemplateUrl: '/partials/smart-table/publish-link-row.html'
        }, {
            map: '_id',
            label: ' ',
            isSortable: false,
            cellTemplateUrl: '/partials/smart-table/remove-link-row.html'
        }];

        $scope.globalConfig = {
            isSortable: true,
            isPaginationEnabled: false
        };
    });
