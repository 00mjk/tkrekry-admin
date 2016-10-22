module.exports = {
  env: 'production',
  mongo: {
    options: {
      replset: {
        socketOptions: {
          keepAlive: 120
        },
        rs_name: 'set-53f20b387a6d6df87d00307d'
      }
    },
    uri: process.env.MONGOHQ_URL || 'mongodb://localhost/tkrekry-admin'
  },
  redis: {
    url: process.env.REDISTOGO_URL || process.env.REDIS_CLOUD_URL
  }
};
