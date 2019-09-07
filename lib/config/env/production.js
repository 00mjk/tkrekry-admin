module.exports = {
  env: 'production',
  mongo: {
    options: {
      replset: {
        socketOptions: {
          keepAlive: 120
        },
        rs_name: 'fcbbda6267cf47588e6a2dd56760a377'
      }
    },
    uri: process.env.MONGODB_URL
  },
  redis: {
    url: process.env.REDISTOGO_URL || process.env.REDIS_CLOUD_URL
  }
};
