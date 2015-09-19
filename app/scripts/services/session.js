angular.module('tkrekryApp')
    .factory('Session', function($resource) {
        'use strict';

        return $resource('/api/session/');
    });
