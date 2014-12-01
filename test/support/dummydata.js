'use strict';

var path = require('path'),
    fs = require('fs'),
    mongoose = require('mongoose');

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'test';

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


var debug  = require('debug')('tkrekry:dummydata'),
    async = require('async'),
    _ = require('lodash'),
    path = require('path'),

    Employer = mongoose.model('Employer'),
    Advertisement = mongoose.model('Advertisement'),
    Office = mongoose.model('Office'),
    Contact = mongoose.model('Contact'),
    User = mongoose.model('User');

var factory = require(path.join(__dirname, 'fixtures/factory'));

var user, employers = [],
    contactsList = {},
    officeList = {},
    advertisements = [];


module.exports.resetDB = function(callback) {
    User.remove({}, function(err, data) {
        debug('user reset', err, data);
        Employer.remove({}, function(err, data) {
            debug('employer reset', err, data);
            Advertisement.remove({}, function(err, data) {
                debug('advertisement reset', err, data);
                Office.remove({}, function(err, data) {
                    debug('office reset', err, data);
                    Contact.remove({}, function() {
                        callback(null, 'reset done');
                    });
                });
            });
        });
    });
};

var createUser = function(defaults, callback) {
    createEmployer({}, function(err, employer) {
        defaults = _.defaults(defaults, {employers: [employer._id]});

        factory.build('user', defaults, function(user_attrs) {
            var user = new User(user_attrs);
            user.save(function(err, data) {

                if (err)
                    debug("Failed to create user %s %s %s", user.first_name, user.last_name, user.email);

                debug('User %s created.', user.email);

                callback(err, data);
            });
        });
    });
};

var createOffice = function(defaults, callback) {
    factory.build('office', defaults, function(doc) {
        var office = new Office(doc);
        office.save(function(err, data) {
            callback(err, data);
        });
    });
};

var createContact = function(defaults, callback) {
    factory.build('contact', defaults, function(doc) {
        var contact = new Contact(doc);
        contact.save(function(err, data) {
            if (err)
                debug('Failed to created contact %s', data.name);

            debug('Contact %s %s created.', data.title, data.email);

            callback(err, data);
        });
    });
};

var createEmployer = function(defaults, callback) {
    factory.build('employer', defaults, function(doc) {
        var employer = new Employer(doc);
        employer.save(function(err, data) {
            callback(err, data);
        });
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
        },
        callback
    ]);
};



