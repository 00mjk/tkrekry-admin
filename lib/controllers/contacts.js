const mongoose = require('mongoose');
const express  = require('express');
const routes = express.Router();
const Promise = require( 'bluebird' );
const middleware = require('../middleware');
const Contact = mongoose.model('Contact');
const _ = require('lodash');
const sessionFilters = require('./session');

mongoose.Promise = Promise;

routes.use(middleware.disableCache);

routes.get('/', middleware.auth, (req, res, next) =>
  sessionFilters.filterByUser(req.user)
    .then((employers) => Contact.findAllByEmployers(employers))
    .then(_)
    .call('sortBy', ['last_name', 'last_name'])
    .then((contacts) => res.status(200).json(contacts))
    .catch(next));


routes.get('/:id', middleware.auth, (req, res, next) =>
  Contact.get(req.params.id)
    .then((contact) => res.status(200).json(contact))
    .catch(next));

module.exports = routes;
