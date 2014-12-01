#!/usr/bin/env node

process.env.NODE_ENV = 'development';

console.log("SEED: Starting to seed for", process.env.NODE_ENV, "environment.");

var seeder = require('../test/support/dummydata');

seeder.resetDB(function(err, data) {
  console.log("SEED: Development database is clean.");

  seeder.seedDB(function(err, data) {
    console.log("SEED: Done");
    process.exit();
  });
})

