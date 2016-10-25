const path = require('path');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const _ = require('lodash');

const dummydata = require(path.join(__dirname, '../support/dummydata'));
const loginPage = require('./pages/login');
const advertisementPage = require('./pages/advertisements');
const factory = require(path.join(__dirname, '../support/fixtures/factory'));
const nodefn = require('when/node');
const buildFactory = Promise.promisify(
  (type, options = {}, callback) => {
    try {
      factory.build(type, options, (doc) => callback(null, doc));
    } catch (e) {
      callback(e);
    }
  }
);
const createFactory = Promise.promisify(
  (type, options = {}, callback) => {
    try {
      factory.create(type, options, (doc) => callback(null, doc));
    } catch (e) {
      callback(e);
    }
  }
);

chai.use(chaiAsPromised);

module.exports = {
  resetDB: dummydata.resetDB,
  seedDB: dummydata.seedDB,
  users: dummydata.users,
  expect: chai.expect,
  loginPage: loginPage,
  advertisementPage: advertisementPage,
  buildFactory: buildFactory,
  createFactory: createFactory,
  _: _
};
