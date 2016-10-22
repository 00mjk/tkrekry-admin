const express = require('express');
const middleware = require('../middleware');
const routes = express.Router();
const Promise = require('bluebird');
const mongoose = require('mongoose');
const Office = mongoose.model('Office');
const _ = require('lodash');
const sessionFilters = require('./session');

mongoose.Promise = Promise;
routes.use(middleware.disableCache);

routes.get('/', (req, res, next) =>
  sessionFilters.filterByUser(req.user)
    .then((employers) => Office.findAllByEmployers(employers))
    .then(_)
    .call('sortBy', ['name'])
    .then((offices) => res.status( 200 ).json(offices))
    .error(next)
    .catch(next));

routes.get('/:id', (req, res, next) =>
  Office.get( req.params.id )
    .then((office) => res.status(200).json(employer))
    .error(next)
    .catch(next));

module.exports = routes;
