'use strict';

module.exports = {
  env: 'development',
  mongo: {
    uri: 'mongodb://mongo/tkrekry-admin'
  },
  redis: {
      db: 0,
      host: 'redis',
      port: 6379
  }
};