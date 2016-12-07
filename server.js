let newrelic = null;

if (process.env.NEW_RELIC_LICENSE_KEY) {
  newrelic = require('newrelic');
}

const express = require('express');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const Promise = require('bluebird');
const _ = require('lodash');

mongoose.Promise = Promise;

/**
 * Main application file
 */

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Application Config
var config = require('./lib/config/config');

// Connect to database
var db = mongoose.connect(config.mongo.uri, config.mongo.options);

// Bootstrap models
var modelsPath = path.join(__dirname, 'lib/models');

fs.readdirSync(modelsPath).forEach(function (file) {
  if (/(.*)\.(js$|coffee$)/.test(file)) {
    require(modelsPath + '/' + file);
  }
});

// Passport Configuration
var passport = require('./lib/config/passport');

var app = express();

if (newrelic) {
  app.locals.newrelic = newrelic;
} else {
  app.locals.newrelic = undefined;
}

// Express settings
require('./lib/config/express')(app);

// Routing
require('./lib/routes')(app);

app.use(function ({constructor: {name}, status, message, errors}, req, res, next) {
  if (name === 'MongooseError') {
    status = 400;
    message = _.reduce(errors, (acc, val, key) => {
      acc.push({ message: val.message, field: key, value: val.value });
      return acc;
    }, []);
  }

  console.log("error", message, errors, name, status);

  res.status(status);
  res.json({ error: message, status: status });
});

// Start server
app.listen(config.port, function () {
  console.log('Express server listening on port %d in %s mode', config.port, app.get('env'));
});

var jobs = require('./lib/config/jobs');

jobs.on('ready', function () {
  jobs.every('1 minutes', 'ManageAdvertisements');
  jobs.start();
});


function graceful() {
  jobs.stop(function () {
    process.exit(0);
  });
}

process.on('SIGTERM', graceful);
process.on('SIGINT', graceful);

// Expose app
exports = module.exports = app;
