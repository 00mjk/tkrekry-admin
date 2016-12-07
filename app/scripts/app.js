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
    'smart-table',
    'ngCkeditor',
    'newrelic-timing'
])
    .constant('angularMomentConfig', {
        timezone: 'Europe/Helsinki'
    })

    .config(function ($routeProvider, $locationProvider, $httpProvider, $logProvider) {
        'use strict';

        $routeProvider
            .when('/', {
                templateUrl: 'partials/main.html',
                controller: 'MainController',
                authenticate: true
            })
            .when('/login', {
                templateUrl: 'partials/login.html',
                controller: 'LoginController'
            })
            .when('/settings/:userId', {
                templateUrl: 'settings/edit.html',
                controller: 'SettingsController',
                authenticate: true
            })
            .when('/employer/select', {
                templateUrl: 'employer/select.html',
                controller: 'EmployerSelectController',
                authenticate: true
            })
            .when('/employers/edit/:id', {
                templateUrl: 'employer/edit.html',
                controller: 'EmployerEditController',
                authenticate: true
            })
            .when('/advertisements/new', {
                templateUrl: 'advertisement/edit.html',
                controller: 'AdvertisementEditController',
                authenticate: true
            })
            .when('/advertisements/edit/:id', {
                templateUrl: 'advertisement/edit.html',
                controller: 'AdvertisementEditController',
                authenticate: true
            })
            .when('/advertisements/copy/:id', {
                controller: 'AdvertisementCopyController',
                templateUrl: 'advertisement/copy.html',
                authenticate: true
            })
            .when('/advertisements/remove/:id', {
                templateUrl: 'advertisement/destroy.html',
                controller: 'AdvertisementDestroyController',
                authenticate: true
            })
            .when('/advertisements/publish/:id', {
                templateUrl: 'advertisement/publish.html',
                controller: 'AdvertisementPublishController',
                authenticate: true
            })
            .when('/advertisements/unpublish/:id', {
                templateUrl: 'advertisement/publish.html',
                controller: 'AdvertisementUnpublishController',
                authenticate: true
            })
            .when('/advertisements/preview/:id', {
                templateUrl: 'advertisement/publish.html',
                controller: 'AdvertisementPreviewController',
                authenticate: true
            })
            .when('/organisation', {
                templateUrl: 'organisation/management.html',
                controller: 'OrganisationManagementController',
                authenticate: true
            })
            .when('/user/new/:employerId', {
                templateUrl: 'user/new.html',
                controller: 'UserNewController',
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
            function ($q, $location) {
                return {
                    'responseError': function (response) {
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
    .run(function ($rootScope, $location, Auth, amMoment) {
        'use strict';

        amMoment.changeLocale('fi');
        $rootScope.year = new Date().getFullYear();
        // Redirect to login if route requires auth and you're not logged in
        $rootScope.$on('$routeChangeStart', function (event, next) {

            if (next.authenticate && !Auth.isLoggedIn()) {
                $location.path('/login');
            }
        });
    });
