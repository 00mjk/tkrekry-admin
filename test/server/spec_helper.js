const path = require('path');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const _ = require('lodash');
const should = require('should');
const async = require('async');
const fs = require('fs');
const mongoose = require('mongoose');
const Promise = require('bluebird');
mongoose.Promise = Promise;

// Bootstrap models
const modelsPath = path.join(__dirname, '../../lib/models');

fs.readdirSync(modelsPath).forEach(function (file) {
  if (/(.*)\.(js$|coffee$)/.test(file)) {
    require(modelsPath + '/' + file);
  }
});

const factory = require(path.join(__dirname, '../support/fixtures/factory'));
const app = require(path.join(__dirname, '../../server'));
const Advertisement = mongoose.model('Advertisement');
const Employer = mongoose.model('Employer');
const User = mongoose.model('User');

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
  should: should,
  app: app,
  factory: factory,
  Advertisement: Advertisement,
  Employer: Employer,
  User: User,
  async: async,
  session: require('supertest-session'),
  expect: chai.expect,
  buildFactory: buildFactory,
  createFactory: createFactory,
  _: _
};
