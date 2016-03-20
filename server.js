'use strict';

if(process.env.NEW_RELIC_LICENSE_KEY) {
  var newrelic = require('newrelic');
}

var express = require('express'),
    path = require('path'),
    fs = require('fs'),
    mongoose = require('mongoose');

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

// Start server
app.listen(config.port, function () {
  console.log('Express server listening on port %d in %s mode', config.port, app.get('env'));
});

var jobs = require('./lib/config/jobs');

jobs.on('ready', function() {
  jobs.every( '1 minutes', 'ManageAdvertisements' );
  jobs.start();
});


function graceful() {
  jobs.stop(function() {
    process.exit(0);
  });
}

process.on('SIGTERM', graceful);
process.on('SIGINT' , graceful);

// Expose app
exports = module.exports = app;
