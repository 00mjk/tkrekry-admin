const express = require('express');
const routes = express.Router();
const Promise = require('bluebird');
const mongoose = require('mongoose');
const Employer = mongoose.model('Employer');
const _ = require('lodash');
const passport = require('passport');
mongoose.Promise = Promise;

/**
 * Login
 */
routes.post('/', (req, res, next) => {
  passport.authenticate('local', {
    badRequestMessage: 'Sähköpostiosoite ja/tai salasana väärin.'
  }, function (error, user) {
    if (error) {
      return res.status(401).json(error);
    }

    req.logIn(user, function (err) {
      if (err) {
        return res.status(401).json({ message: 'Sähköpostiosoite ja/tai salasana väärin.' });
      } else {
        return res.status(200).json(req.user.userInfo);
      }
    });
  })(req, res, next);
});

/**
 * Logout
 */
routes.delete('/', function (req, res, next) {
  req.logout();
  return res.status(200).json({ logout: 'done' });
});

module.exports.routes = routes;

/**
 * Auth required
 */

module.exports.filterByUser = function ({ role = '', employers = []}) {
  return new Promise((resolve, reject) => {
    if (role === 'admin') {
      resolve(Employer.find({}, '_id').exec());
    } else {
      resolve(employers);
    }
  });
};

const rejectError = () => {
  let error = new Error('Access to resource not allowed');
  error.status = 403;
  return error;
}

module.exports.isAllowed = ({ role, employers = []}, targetEmployers = [], ...resources) =>
  new Promise((resolve, reject) => {
    targetEmployers = _.chain(targetEmployers)
      .castArray()
      .compact()
      .map((doc) => doc.toString())
      .uniq()
      .value();

    if (role === 'admin') {
      if (_.isEmpty(targetEmployers)) {
        return resolve(resources);
      }

      Employer.existingIds(targetEmployers)
        .then(_)
        .call('pick', '_id')
        .call('map', (id) => _.includes(targetEmployers, id.toString()))
        .call('every')
        .then((isAllowed) => {
          if (isAllowed) {
            resolve(resources);
          } else {
            reject(rejectError());
          }
        })
    } else {
      if (_.isEmpty(employers) || _.isEmpty(targetEmployers)) {
        return reject(rejectError());
      }

      const employerIds = _.map(employers, (doc) => doc.toString());
      const allowed = _.chain(targetEmployers).map((emp) => _.includes(employerIds, emp)).every().value();

      if (allowed) {
        resolve(resources);
      } else {
        reject(rejectError());
      }
    }
  });
