'use strict';

module.exports = {
  env: 'test',
  mongo: {
    uri: 'mongodb://dockerhost/fullstack-test'
  },
  redis: {
    ttl: 60 * 60 * 24,
    prefix: 'sessions:',
    db: 0,
    host: 'dockerhost',
    port: 6379
  }
};