var path = require('path'),
    chai = require('chai'),
    chaiAsPromised = require('chai-as-promised'),
    _ = require('lodash');

var dummydata = require(path.join(__dirname, '../support/dummydata')),
    loginPage = require('./pages/login'),
    advertisementPage = require('./pages/advertisements'),
    factory = require(path.join(__dirname, '../support/fixtures/factory')),
    nodefn = require('when/node');

chai.use(chaiAsPromised);

module.exports = {
  resetDB: dummydata.resetDB,
  seedDB: dummydata.seedDB,
  users: dummydata.users,
  expect: chai.expect,
  loginPage: loginPage,
  advertisementPage: advertisementPage,
  _: _
};