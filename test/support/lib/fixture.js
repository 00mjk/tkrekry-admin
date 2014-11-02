'use strict';

var path = require("path"),
    fs = require("fs");

module.exports = function(fixture) {
  return fs.readFileSync(path.resolve('test/support/fixtures', fixture), 'utf-8');
};
