// 'use strict';

angular.module('tkrekryApp')
    .factory('Session', function($resource) {
        return $resource('/api/session/');
    });
