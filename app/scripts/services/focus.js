angular.module('tkrekryApp')
    .factory('focus', function($rootScope, $timeout) {
        'use strict';
        return function(name) {
            $timeout(function() {
                $rootScope.$broadcast('focusOn', name);
            }, 0, false);
        };
    });
