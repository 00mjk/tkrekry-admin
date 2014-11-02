// 'use strict';

angular.module('tkrekryApp')
    .service('Office', function Office($resource) {
        return $resource('/api/offices/:id', {}, {
            list: {
                method: 'GET',
                params: {
                    id: ''
                },
                isArray: true
            },
            create: {
                method: 'POST',
                params: {
                    id: ''
                }
            },
            show: {
                method: 'GET',
                params: {
                    id: '@id'
                }
            },
            update: {
                method: 'PUT',
                params: {
                    id: '@id'
                }
            },
            remove: {
                method: 'DELETE',
                params: {
                    id: '@id'
                }
            }
        });
    });
