module.exports = {
  env: 'production',
  mongo: {
    options: {
      replset: {
        socketOptions: {
          keepAlive: 120
        }
      }
    },
    uri: process.env.MONGOHQ_URL
  },
  redis: {
    url: process.env.REDISTOGO_URL || process.env.REDIS_CLOUD_URL
  }
};
