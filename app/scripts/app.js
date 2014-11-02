// 'use strict';

angular.module('tkrekryApp', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute',
    'angular-loading-bar',
    'ui',
    'ui.bootstrap',
    'ui.router',
    'angularMoment',
    'smartTable.table',
    'ngCkeditor',
    'newrelic-timing'
])
    .config(function($routeProvider, $locationProvider, $httpProvider, $logProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'partials/main.html',
                controller: 'MainCtrl',
                authenticate: true
            })
            .when('/login', {
                templateUrl: 'partials/login.html',
                controller: 'LoginCtrl'
            })
            .when('/settings/:userId', {
                templateUrl: 'settings/edit.html',
                controller: 'SettingsCtrl',
                authenticate: true
            })
            .when('/employer/edit', {
                templateUrl: 'employer/edit.html',
                controller: 'EmployerEditCtrl',
                authenticate: true
            })
            .when('/advertisements/new', {
                templateUrl: 'advertisement/edit.html',
                controller: 'AdvertisementEditCtrl',
                authenticate: true
            })
            .when('/advertisements/edit/:id', {
                templateUrl: 'advertisement/edit.html',
                controller: 'AdvertisementEditCtrl',
                authenticate: true
            })
            .when('/advertisements/copy/:id', {
                controller: 'AdvertisementCopyCtrl',
                templateUrl: 'advertisement/copy.html',
                authenticate: true
            })
            .when('/advertisements/remove/:id', {
                templateUrl: 'advertisement/destroy.html',
                controller: 'AdvertisementDestroyCtrl',
                authenticate: true
            })
            .when('/advertisements/publish/:id', {
                templateUrl: 'advertisement/publish.html',
                controller: 'AdvertisementPublishCtrl',
                authenticate: true
            })
            .when('/advertisements/unpublish/:id', {
                templateUrl: 'advertisement/publish.html',
                controller: 'AdvertisementUnpublishCtrl',
                authenticate: true
            })
            .when('/advertisements/preview/:id', {
                templateUrl: 'advertisement/publish.html',
                controller: 'AdvertisementPreviewCtrl',
                authenticate: true
            })
            .when('/organisation', {
                templateUrl: 'organisation/management.html',
                controller: 'OrganisationManagementCtrl',
                authenticate: true
            })
            .when('/user/new/:employerId', {
                templateUrl: 'user/new.html',
                controller: 'UserNewCtrl',
                authenticate: true
            })
            .when('/help', {
                templateUrl: 'partials/help',
                authenticate: true
            })
            .otherwise({
                redirectTo: '/'
            });

        $locationProvider.html5Mode(false);

        // Intercept 401s and redirect you to login
        $httpProvider.interceptors.push(['$q', '$location',
            function($q, $location) {
                return {
                    'responseError': function(response) {
                        if (response.status === 401) {
                            $location.path('/login');
                            return $q.reject(response);
                        } else {
                            return $q.reject(response);
                        }
                    }
                };
            }
        ]);
    })
    .run(function($rootScope, $location, Auth, amMoment) {

        amMoment.changeLanguage('fi');

        // Redirect to login if route requires auth and you're not logged in
        $rootScope.$on('$routeChangeStart', function(event, next) {

            if (next.authenticate && !Auth.isLoggedIn()) {
                $location.path('/login');
            }
        });
    });
