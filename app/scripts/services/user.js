// 'use strict';

angular.module('tkrekryApp')
    .factory('User', function($resource) {
        return $resource('/api/users/:id', {
            id: '@id'
        }, { //parameters default
            update: {
                method: 'PUT',
                params: {
                    id: '@id'
                }
            },
            get: {
                method: 'GET',
                params: {
                    id: 'me'
                }
            },
            list: {
                method: 'GET',
                isArray: true,
                params: {
                    id: ''
                }
            },
            destroy: {
                method: 'DELETE',
                params: {
                    id: '@id'
                }
            }
        });
    });
