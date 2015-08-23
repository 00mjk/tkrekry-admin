'use strict';

module.exports = {
  env: 'development',
  mongo: {
    uri: 'mongodb://mongo/tkrekry-admin'
  },
  redis: {
      db: 0,
      host: 'rediss',
      port: 6379
  }
};