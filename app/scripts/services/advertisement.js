// 'use strict';

angular.module('tkrekryApp')
    .service('Advertisement', function Advertisement($resource, Auth, _) {
        var user = Auth.currentUser();
        var isAllowed = function(advertisement) {
            return _(user.employers).contains(advertisement.employer);
        };

        return $resource('/api/advertisements/:id/:method', {}, {
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
                method: 'PUT'
            },
            remove: {
                method: 'DELETE',
                params: {
                    id: '@id'
                }
            },
            publish: {
               method: 'POST',
                params: {
                    id: '@id',
                    method: 'publish'
                }
            },
            unpublish: {
               method: 'POST',
                params: {
                    id: '@id',
                    method: 'unpublish'
                }
            }
        });
    });
