'use strict';

var debug  = require('debug')('tkrekry:controllers:contacts'),
    mongoose = require('mongoose'),
    express  = require('express'),
    routes = express.Router(),
    middleware = require('../middleware'),
    Contact = mongoose.model('Contact'),
    _ = require('lodash'),
    User = mongoose.model('User'),
    sessionFilters = require('./session');

routes.use(middleware.disableCache);

routes.get('/', middleware.auth, function(req, res) {
  sessionFilters.filterByUser(req.user, function(err, employers) {
    Contact.findAllByEmployers(employers, function(err, contacts) {
      res.status(200).json(_.sortBy(contacts, ['last_name', 'last_name']));
    });
  });
});

routes.get('/:id', middleware.auth, function(req, res) {
  Contact.get(req.params.id, function(err, employer) {
    if (err) {
      return res.status(404).json({});
    } else {
      return res.status(200).json(employer);
    }
  });
});

module.exports = routes;