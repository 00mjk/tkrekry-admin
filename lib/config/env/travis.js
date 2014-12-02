'use strict';

module.exports = {
  env: 'test',
  mongo: {
    uri: 'mongodb://127.0.0.1/travis-test'
  },
  redis: {
    db: 0,
    host: 'localhost',
    port: 6379
  }
};