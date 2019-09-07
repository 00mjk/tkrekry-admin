module.exports = {
  env: 'production',
  mongo: {
    options: {
      replset: {
        socketOptions: {
          keepAlive: 120
        },
        rs_name: '069459b4602c49378f0b310d1cb531e1'
      }
    },
    uri: process.env.MONGODB_URL
  },
  redis: {
    url: process.env.REDISTOGO_URL || process.env.REDIS_CLOUD_URL
  }
};