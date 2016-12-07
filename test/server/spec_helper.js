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

const resetDB = () => Promise.join(
  User.remove({}).exec(),
  Advertisement.remove({}).exec(),
  Employer.remove({}).exec(),
  () => {}
);

const createEmployers = () => Promise.join(
  createFactory('employer', {}),
  createFactory('employer', {}),
  createFactory('employer', {}),
  (...employers) => employers
);

const createUsers = (defaults, employers) => Promise.join(
  createFactory('user', _.merge(defaults, {
    employers: [employers[0]._id],
    email: 'test@test.com',
    password: 'password',
    role: 'user'
  })),
  createFactory('user', _.merge(defaults, {
    employers: [employers[1]._id],
    email: 'test-1@test.com',
    password: 'password',
    role: 'user'
  })),
  createFactory('user', _.merge(defaults, {
    employers: [employers[2]._id],
    email: 'test-2@test.com',
    password: 'password',
    role: 'user'
  })),
  createFactory('user', _.merge(defaults, {
    employers: employers.map((employer) => employer._id),
    email : 'admin@test.com',
    role : 'admin'})),
  (...users) => users);

const advertisementForEmployers = (employers) => Promise.map(
  employers, (employer) =>
    createFactory('advertisement', { employer: employer })
);

const loginUser = (user, session, ...resources) =>
  new Promise((resolve, reject) => {
    session
      .post('/api/session')
      .send({ email: user.email, password: 'password' })
      .expect(200)
      .end((err) => {
        if (err) {
          reject(err);
        } else {
          resolve([session, resources]);
        }
      });
  });


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
  resetDB: resetDB,
  createEmployers: createEmployers,
  createUsers: createUsers,
  advertisementForEmployers: advertisementForEmployers,
  loginUser: loginUser,
  _: _
};
