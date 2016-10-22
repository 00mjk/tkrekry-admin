const path = require('path');
const rootPath = path.normalize(__dirname + '/../../..');

module.exports = {
  root: rootPath,
  port: process.env.PORT || 3000,
  mongo: {
    options: {
      db: {
        safe: true
      }
    }
  },
  redis: {
    ttl: 60 * 60 * 24,
    prefix: 'sessions:'
  }
};
