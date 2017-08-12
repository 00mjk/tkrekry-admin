module.exports = {
  env: 'production',
  mongo: {
    options: {
      replset: {
        socketOptions: {
          keepAlive: 120
        },
        rs_name: 'set-58392d4afd0a7bbfd00001e1'
      }
    },
    uri: process.env.MONGOHQ_URL_RS || process.env.MONGOHQ_URL
  },
  redis: {
    url: process.env.REDISTOGO_URL || process.env.REDIS_CLOUD_URL
  }
};