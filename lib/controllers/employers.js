const mongoose = require('mongoose');
const Promise = require('bluebird');
const express  = require('express');
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
  sessionFilters.filterByUser(req.user)
    .then((employers) => Employer.findAllByEmployers(employers))
    .then(_)
    .call('sortBy', 'name')
    .then((employers) => res.status(200).json(employers))
    .error(next)
    .catch(next));

routes.get('/:id', (req, res, next) =>
  Employer.get(req.params.id)
    .then((employer) => res.status(200).json(employer))
    .error(next)
    .catch(next));

routes.post('/', middleware.auth, (req, res, next) =>
  sessionFilters.isAllowed(req.user, req.body.employer)
    .then(() => (new Employer(req.body.employer)).save())
    .then(() => res.status(201).json({}))
    .error(next)
    .catch(next));

routes.put('/:id', middleware.auth, (req, res, next) =>
  Employer.get(req.params.id)
    .then((employer) => sessionFilters.isAllowed(req.user, [req.body._id, employer._id], employer))
    .then(([employer]) => {
      var updateEmployer = req.body;
      var updateEmployerId = updateEmployer._id;

      delete updateEmployer._id;
      delete updateEmployer.__v;
      delete updateEmployer.contacts;
      delete updateEmployer.offices;
      delete updateEmployer.users;

      updateEmployer.updated_at = new Date();

      return Employer.findByIdAndUpdate(employer._id, updateEmployer, { safe: true, upsert: true });
    })
    .then((employer) => {
      var contacts = _.reduce(req.body.contacts, function(list, contact) {
          contact.employer = updateEmployerId;
          delete contact._id;
          return list.concat(contact);
      }, []);

      var offices = _.reduce(req.body.offices, function(list, office) {
          office.employer = updateEmployerId;
          delete office._id;
          return list.concat(office);
      }, []);

      var users = _.reduce(req.body.users, function(list, user) {
          return list.concat(user.id);
      }, []);

      return Promise.join(
        User.removeFromEmployer(employer._id),
        User.addToEmployer(users, employer._id),
        Office.setAllByEmployers(employer._id, offices),
        Contact.setAllByEmployers(employer._id, contacts),
        (r, u, office, contacs) =>
          Employer.update({ _id: employer._id }, { offices: offices, contacts: contacts })
          .exec());
    })
    .then(() => res.status(200).json({}))
    .error(next)
    .catch(next));

routes.delete('/:id', middleware.auth, (req, res, next) =>
  Employer.get(req.params.id)
  .then((employer) => sessionFilters.isAllowed(req.user, employer._id, employer))
  .then(([employer]) => Employer.delete(employer._id))
  .then(() => res.status(200).json(req.params.id))
  .error(next)
  .catch(next));

module.exports = routes;
