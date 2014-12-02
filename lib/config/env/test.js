'use strict';

module.exports = {
  env: 'test',
  mongo: {
    uri: 'mongodb://dockerhost/fullstack-test'
  },
  redis: {
    db: 0,
    host: 'dockerhost',
    port: 6379
  }
};