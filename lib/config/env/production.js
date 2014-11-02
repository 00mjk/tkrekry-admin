'use strict';

module.exports = {
  env: 'production',
  mongo: {
    uri: process.env.MONGOHQ_URL || 'mongodb://localhost/tkrekry-admin'
  },
  redis: {
    url: process.env.REDISTOGO_URL || process.env.REDIS_CLOUD_URL
  }
};