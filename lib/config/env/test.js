module.exports = {
  env: 'test',
  mongo: {
    uri: 'mongodb://localhost/travis-test'
  },
  redis: {
    db: 0,
    host: 'localhost',
    port: 6379
  }
};
