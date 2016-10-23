const mongoose = require('mongoose');
const express = require('express');
const routes = express.Router();
const middleware = require('../middleware');
const Advertisement = mongoose.model('Advertisement');
const _ = require('lodash');
const moment = require('moment');
const Promise = require('bluebird');
const sessionFilters = require('./session');

mongoose.Promise = Promise;

const transformFiels = (advertisement) => {
  var date_fields = ['application_period_end', 'publication_day', 'application_placed_on', 'published_at'];
  return _.transform(advertisement, function (result, value, key) {
    if (_.includes(date_fields, key)) {
      if (_.isDate(value)) {
        result[key] = value;
        return result;
      }
      if (_.isString(value)) {
        result[key] = ((moment(value).isValid() && moment(value).utc().format()) || (moment(value, 'DD.MM.YYYY').isValid() && moment(value, 'DD.MM.YYYY').utc().format()));
        return result;
      }
      result[key] = null;
      return result;
    } else {
      result[key] = value;
      return result;
    }
  });
};

routes.use(middleware.disableCache);

routes.get('/published', (req, res, next) =>
  Advertisement
    .published()
    .then(_)
    .call('sortBy', 'updated_at')
    .then((advertisements) => res.status(200).json(advertisements))
    .catch(next));

routes.get('/', (req, res, next) =>
  sessionFilters.filterByUser(_.get(req, 'user', {}))
    .then((employers) => Advertisement.findAllByEmployers(employers))
    .then(_)
    .call('sortBy', 'updated_at')
    .then((advertisements) => res.status(200).json(advertisements))
    .catch((error) => console.log("error", error))
    .catch(next));

routes.get( '/:id', (req, res, next) =>
  Advertisement
    .get(req.params.id)
    .then((advertisement) => res.status(200).json(advertisement))
    .catch(next));

routes.post('/', middleware.auth, (req, res, next) =>
  sessionFilters.isAllowed( req.user, req.body.employer)
    .then(() => (new Advertisement(transformFiels(req.body))).save())
    .then((advertisement) => res.status(200).json(advertisement))
    .catch(next));

routes.put( '/:id', middleware.auth, (req, res, next) =>
  Advertisement.get( req.params.id )
    .then((advertisement) => sessionFilters.isAllowed(req.user, advertisement.employer, advertisement))
    .then(([advertisement]) => {
      var updateAdvertisement = transformFiels( req.body );
      delete updateAdvertisement._id;
      delete updateAdvertisement.__v;
      updateAdvertisement.updated_at = new Date();
      return Promise.resolve([advertisement, updateAdvertisement]);
    })
    .then(([advertisement, updateAdvertisement]) => sessionFilters.isAllowed(req.user, [updateAdvertisement.employer._id, advertisement.employer], advertisement, updateAdvertisement))
    .then(([advertisement, updateAdvertisement]) =>
      Advertisement.findByIdAndUpdate(advertisement._id, updateAdvertisement, {
        safe: true,
        upsert: true
      }))
    .then(() => res.status(200).json({}))
    .catch(next));

routes.delete('/:id', middleware.auth, (req, res, next) =>
  Advertisement.get(req.params.id)
    .then((advertisement) => sessionFilters.isAllowed(req.user, advertisement.employer, advertisement))
    .then(() => Advertisement.delete(req.params.id))
    .then(() => res.status(200).json(req.params.id))
    .catch(next));

routes.post( '/:id/publish', middleware.auth, (req, res, next) =>
  Advertisement.get( req.params.id )
    .then((advertisement) => sessionFilters.isAllowed(req.user, advertisement.employer, advertisement))
    .then(([advertisement]) => advertisement.publish())
    .then((advertisement) => res.status(200).json(advertisement))
    .catch(next));

routes.post('/:id/unpublish', middleware.auth, (req, res, next) =>
  Advertisement.get(req.params.id)
    .then((advertisement) => sessionFilters.isAllowed(req.user, advertisement.employer, advertisement))
    .then(([advertisement]) => advertisement.unpublish())
    .then((advertisement) => res.status(200).json(advertisement))
    .catch(next));

module.exports = routes;
