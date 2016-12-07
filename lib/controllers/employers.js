const mongoose = require('mongoose');
const Promise = require('bluebird');
const express = require('express');
const routes = express.Router();
const middleware = require('../middleware');
const Employer = mongoose.model('Employer');
const _ = require('lodash');
const User = mongoose.model('User');
const Contact = mongoose.model('Contact');
const Office = mongoose.model('Office');
const sessionFilters = require('./session');

mongoose.Promise = Promise;
routes.use(middleware.disableCache);

routes.get('/', (req, res, next) =>
  sessionFilters.filterByUser(_.get(req, 'user', {}))
    .then((employers) => Employer.findAllByEmployers(employers))
    .then(_)
    .call('sortBy', 'name')
    .then((employers) => res.status(200).json(employers))
    .catch(next));

routes.get('/:id', (req, res, next) =>
  Employer.get(req.params.id)
    .then((employer) => res.status(200).json(employer))
    .catch(next));

routes.post('/', middleware.auth, (req, res, next) =>
  Promise.resolve(req)
    .then((r) => _.pick(r, ['user', 'body']))
    .then(({ user, body: employerParams }) =>
      sessionFilters.isAllowed(user, [], employerParams))
    .then(([employerParams]) =>
      new Employer(employerParams))
    .then((employer) =>
      employer.save())
    .then(() =>
      res.status(201).json({}))
    .catch((error) => {
      if (!error.status) {
        error.status = 403;
      }
      next(error);
    }));

routes.put('/:id', middleware.auth, (req, res, next) =>
  Employer.get(req.params.id)
    .then((employer) => sessionFilters.isAllowed(req.user, [req.body._id, employer._id], employer))
    .then(([employer]) => {
      let updateEmployer = _.omit(req.body, ['_id', '__v', 'contacts', 'offices', 'users']);
      updateEmployer.updated_at = new Date();
      return Employer.findByIdAndUpdate(employer._id, updateEmployer, { safe: true, upsert: true });
    })
    .then((employer) => {
      const employerId = req.params.id;
      const contacts = _.reduce(req.body.contacts, (acc, contact) =>
        _.concat(acc,
          _.chain(contact)
            .set('employer', employerId)
            .omit('_id')
            .value()), []);
      const offices = _.reduce(req.body.offices, (acc, office) =>
        _.concat(acc,
          _.chain(office)
            .set('employer', employerId)
            .omit('_id')
            .value()), []);
      const users = _.reduce(req.body.users, (acc, {id}) => _.concat(acc, id), []);
      const pickId = (obj) => _.pick(obj, '_id');

      return Promise.join(
        User.removeFromEmployer(employerId),
        User.addToEmployer(users, employerId),
        Office.setAllByEmployers(employerId, offices),
        Contact.setAllByEmployers(employerId, contacts),
        (r, u, _offices, _contacs) =>
          Employer.findByIdAndUpdate(employerId,
            {
              offices: _.map(_offices, pickId),
              contacts: _.map(_contacs, pickId)
            },
            { safe: true, upsert: true }
          ).exec()
      );
    })
    .then(() => Employer.get(req.params.id))
    .then((employer) => res.status(200).json(employer))
    .catch(next));

routes.delete('/:id', middleware.auth, (req, res, next) =>
  Employer.get(req.params.id)
    .then((employer) => sessionFilters.isAllowed(req.user, employer._id, employer))
    .then(([employer]) => Employer.delete(employer._id))
    .then(() => res.status(200).json(req.params.id))
    .catch(next));

module.exports = routes;
