angular.module('tkrekryApp')
    .service('Organisation', function Organisation($resource) {
        'use strict';

        return $resource('/api/organisation/:type', null, {
            domains: {
                method: 'GET',
                isArray: true,
                cache: true,
                params: {
                    type: 'domains'
                }
            },
            districts: {
                method: 'GET',
                isArray: true,
                cache: true,
                params: {
                    type: 'districts'
                }
            },
            jobDurations: {
                method: 'GET',
                isArray: true,
                cache: true,
                params: {
                    type: 'job_duration'
                }
            },
            jobProfessionGroups: {
                method: 'GET',
                isArray: true,
                cache: true,
                params: {
                    type: 'job_profession_group'
                }
            },
            jobTypes: {
                method: 'GET',
                isArray: true,
                cache: true,
                params: {
                    type: 'job_type'
                }
            }
        });
    });
