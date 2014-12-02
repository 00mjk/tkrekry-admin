'use strict';

module.exports = {
  env: 'development',
  mongo: {
    uri: 'mongodb://dockerhost/tkrekry-admin'
  },
  redis: {
      db: 0,
      host: 'dockerhost',
      port: 6379
  }
};