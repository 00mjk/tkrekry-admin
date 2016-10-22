'use strict';

const path = require('path');
const fs = require('fs');
const Promise = require('bluebird');
const _ = require('lodash');
const mongoose = require('mongoose');
const debug  = require('debug')('tkrekry:dummydata');
const async = require('async');
mongoose.Promise = require( 'bluebird' );

// Set default node environment to development
// process.env.NODE_ENV = process.env.NODE_ENV || 'test';

// Application Config
var config = require(path.join(__dirname, '../../lib/config/config'));

// Connect to database
var db = mongoose.connect(config.mongo.uri, config.mongo.options);

// Bootstrap models
var modelsPath = path.join(__dirname, '../../lib/models');

fs.readdirSync(modelsPath).forEach(function (file) {
  if (/(.*)\.(js$|coffee$)/.test(file)) {
    require(modelsPath + '/' + file);
  }
});

const Employer = mongoose.model('Employer');
const Advertisement = mongoose.model('Advertisement');
const Office = mongoose.model('Office');
const Contact = mongoose.model('Contact');
const User = mongoose.model('User');

const factory = require(path.join(__dirname, 'fixtures/factory'));

let user;
let employers = [];
let contactsList = {};
let officeList = {};
let advertisements = [];

module.exports.resetDB = (callback) =>
  Promise.join(
    User.remove(),
    Employer.remove(),
    Advertisement.remove(),
    Office.remove(),
    Contact.remove(),
    (u, e, a, o, c) => callback(null, 'reset done'));


var pFactory = Promise.promisify(
  (type, options = {}, callback) =>
    factory.build(type, options, (doc) => callback(null, doc)));


var createEmployer = function(defaults, callback) {
    factory.build('employer', defaults, function(doc) {
        var employer = new Employer(doc);
        employer.save().then((data) => callback(null, data));
    });
};

var createUser = function(defaults, callback) {
    createEmployer({}, function(err, employer) {
        defaults = _.defaults(defaults, {employers: [employer._id]});

        factory.build('user', defaults, function(user_attrs) {
            var user = new User(user_attrs);
            user.save().then((data) => callback(null, data));
        });
    });
};

var createOffice = function(defaults, callback) {
    factory.build('office', defaults, function(doc) {
        var office = new Office(doc);
        office.save().then((data) => callback(null, data));
    });
};

var createContact = function(defaults, callback) {
    factory.build('contact', defaults, function(doc) {
        var contact = new Contact(doc);
        contact.save().then((data) => callback(null, data));
    });
};

var users = module.exports.users = {
    admin: {
        username: 'admin@example.com',
        password: 'password'
    },
    normal: {
        username: 'normal@example.com',
        password: 'password'
    }
};

module.exports.seedDB = function(callback) {
    async.waterfall([
        function (cb) {
            createUser({email: users.admin.username, password: users.admin.password, role: 'admin'}, function(err, user) {
                cb(null, user);
            });
        },
        function (adminUser, cb) {
            createContact({employer: adminUser.employers[0]}, function(err, contact) {
                contact.employer = adminUser.employers[0];
                contact.save(function(err, saved) {
                    cb(null, adminUser);
                });
            });
        },
        function(adminUser, cb) {
          createUser({email: users.normal.username, password: users.normal.password}, function(err, user){
            cb(null, adminUser, user);
          });
        },
        function (adminUser, user, cb) {
            createContact({employer: user.employers.first}, function(err, da) {
                cb(null, adminUser);
            });
        }
    ], callback);
};
