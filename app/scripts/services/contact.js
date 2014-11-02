// 'use strict';

angular.module('tkrekryApp')
    .service('Contact', function Contact($resource) {
        return $resource('/api/contacts/:id', {}, {
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
