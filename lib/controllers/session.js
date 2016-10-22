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
        return res.status(401).json(err);
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
  return res.status(200).json({logout: 'done'});
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

var document_id_to_string = function (document_id) {
  return document_id.toString();
};

const rejectError = () => {
  let error = new Error('Access to resource not allowed');
  error.status = 403;
  return error;
}

module.exports.isAllowed = ({ role, employers = [] }, targetEmployers = [], ...resources) => {
  return new Promise((resolve, reject) => {
    targetEmployers = _.chain(targetEmployers)
      .castArray()
      .compact()
      .map(document_id_to_string)
      .uniq()
      .value();

    if (role === 'admin') {
      Employer.existingIds(targetEmployers)
        .then(_)
        .call('map', '_id')
        .call('map', document_id_to_string)
        .call('isEqual', targetEmployers)
        .then((isAllowed) => {
          if (isAllowed) {
            resolve(resources);
          } else {
            reject(rejectError());
          }
        })
    } else {
      if (_.chain(employers).map(document_id_to_string).isEqual(targetEmployers).value()) {
        resolve(resources);
      } else {
        reject(rejectError());
      }
    }
  });
};
