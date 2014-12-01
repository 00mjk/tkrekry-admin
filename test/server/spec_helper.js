var path = require('path'),
    chai = require('chai'),
    chaiAsPromised = require('chai-as-promised'),
    _ = require('lodash'),
    should = require( 'should' ),
    async = require( 'async' ),
    fs = require('fs'),
    mongoose = require( 'mongoose' );

// Bootstrap models
var modelsPath = path.join(__dirname, '../../lib/models');

fs.readdirSync(modelsPath).forEach(function (file) {
  if (/(.*)\.(js$|coffee$)/.test(file)) {
    require(modelsPath + '/' + file);
  }
});

var factory = require(path.join(__dirname, '../support/fixtures/factory')),
    app = require(path.join(__dirname, '../../server')),
    Advertisement = mongoose.model( 'Advertisement' ),
    Employer = mongoose.model( 'Employer' ),
    User = mongoose.model( 'User' ),
    Session = require('supertest-session')({ app: app });

chai.use(chaiAsPromised);

module.exports = {
  should: should,
  app: app,
  factory: factory,
  Advertisement: Advertisement,
  Employer: Employer,
  User: User,
  async: async,
  Session: Session,
  expect: chai.expect,
  _: _
};