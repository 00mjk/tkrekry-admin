// 'use strict';

angular.module('tkrekryApp')
    .factory('focus', function($rootScope, $timeout) {
        return function(name) {
            $timeout(function() {
                $rootScope.$broadcast('focusOn', name);
            }, 0, false);
        };
    });
