const debug = require('debug')('tkrekry:controllers:users');
const express = require('express');
const Promise = require('bluebird');
const middleware = require('../middleware');
const routes = express.Router();
const mongoose = require('mongoose');
const Office = mongoose.model('Office');
const User = mongoose.model('User');
const _ = require('lodash');
const nodeExcel = require('excel-export');
const passport = require('passport');
const moment = require('moment');
const sessionFilters = require('./session');

mongoose.Promise = Promise;
routes.use(middleware.disableCache);

/**
 * Get current user
 */
routes.get('/me', middleware.auth, function (req, res) {
  res.json(req.user || null);
});

/**
 * List user
 */
routes.get('/report', middleware.auth, function (req, res, next) {
  if (req.user.role === 'admin') {
    var conf = {};
    conf.cols = [
      {
        caption: 'Etunimi',
        type: 'string'
      }, {
        caption: 'Sukunimi',
        type: 'string'
      }, {
        caption: 'Puhelin',
        type: 'string'
      }, {
        caption: 'Sähköposti',
        type: 'string'
      }, {
        caption: 'Varasähköposti',
        type: 'string'
      }, {
        caption: 'Viimeksi kirjautunut',
        type: 'string'
      }, {
        caption: 'Kaikkiaan kirjautunut',
        type: 'number'
      }, {
        caption: 'Rooli',
        type: 'string'
      }, {
        caption: 'Työnantajat',
        type: 'string'
      }, {
        caption: 'Sairaanhoitopiiri',
        type: 'string'
      }
    ];

    User.find({}).populate('employers').exec(function (err, users) {
      if (err) {
        return res.status(500).json(err);
      }

      conf.rows = _.map(users, function (user) {
        var employers = _.compact(_.map(user.employers, 'name')),
          domain = _.compact(_.map(user.employers, 'domain'));

        var domainName = (_.isEmpty(domain)
            ? 'Tyhjä'
            : _.map(domain, 'name').join(', ')),
          employerName = (_.isEmpty(employers)
            ? 'Tyhjä'
            : employers.join(', '));

        return [
          (user.first_name || 'Puutuu'),
          (user.last_name || 'Puutuu'),
          (user.phone || 'Puutuu'),
          (user.email || 'Puutuu'),
          (user.fallback_email || 'Puutuu'),
          (user.last_login + '' || 'Puutuu'),
          (user.login_count || 0),
          (user.role || 'Puutuu'),
          (employerName || 'Puutuu'),
          (domainName || 'Puutuu')
        ].toArray();
      }).toArray();

      var result = nodeExcel.execute(conf);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=' + 'user-report.xlsx');
      return res.end(result, 'binary');

    });
  } else {
    return res.status(403).json({});
  }
});

/**
 * Create user
 */
routes.post('/', middleware.auth, middleware.isAdmin, (req, res, next) =>
  Promise.resolve(new User(req.body))
    .then((newUser) => {
      newUser.provider = 'local'
      return newUser;
    })
    .then((newUser) => newUser.save())
    .then((newUser) =>  res.status(200).json(newUser))
    .catch(next));

/**
 * Destroy user
 */
const isItMe = (sessionUserId, requestUserId) =>
  new Promise((resolve, reject) => {
    if (sessionUserId === requestUserId) {
      let error = new Error("Can't destroy self!!");
      error.status = 400;
      reject(error);
    } else {
      resolve(requestUserId);
    }
  });

routes.delete('/:id', middleware.auth, middleware.isAdmin, (req, res, next) =>
  isItMe(req.user._id, req.params.id)
    .then((userId) => User.remove({_id: userId}))
    .then((user) => res.status(200).json(user))
    .catch(next));

/**
 *  Get profile of specified user
 */
routes.get('/:id', middleware.auth, (req, res, next) =>
  User.findById(req.params.id, '-salt -hashedPassword -provider')
    .then((user) => res.status(200).json({ profile: user.userInfo }))
    .catch(next));

/**
 * Change password
 */
const allowedToChanges = (role, password, user) => {
  return new Promise((resolve, reject) => {
    if ((role === 'admin') || user.authenticate(password)) {
      resolve(user);
    } else {
      let error = new Error(`Auth failed.`);
      error.status = 403;
      reject(error);
    }
  });
}
const setEmployers = (role = '', employers = [], user) => {
  return new Promise((resolve) => {
    if (role === 'admin') {
      user.employers = _.chain(employers).castArray().compact().map('_id').value();
    }
    resolve(user);
  });
}
const setPassword = (role = '', password = '', user) => {
  return new Promise((resolve, reject) => {
    if (_.chain(password).size().gt(12).value()) {
      user.password = password;
      resolve(user);
    } else {
      let error = new Error(`Invalid password.`);
      error.status = 400;
      reject(error);
    }
  });
}
routes.put('/:id', middleware.auth, (req, res, next) =>
  Promise.resolve((req.user.role === 'admin' ? req.params.id : req.user._id))
    .then((userId) => User.findById(userId))
    .then((user) => allowedToChanges(req.user.role, req.body.current_password, user))
    .then((user) => setEmployers(req.user.role, req.body.employers, user))
    .then((user) => setPassword(req.user.role, req.body.new_password, user))
    .then((user) => new Promise((resolve) => {
      user.first_name = req.body.first_name;
      user.last_name = req.body.last_name;
      user.phone = req.body.phone;
      user.fallback_email = req.body.fallback_email;
      resolve(user);
    }))
    .then((user) => user.save())
    .then((user) => res.status(200).json({}))
    .catch(next));

routes.get('/', middleware.auth, (req, res, next) =>
  User.find({}).exec()
  .then(_)
  .call('map', (user) => user.userInfo)
  .call('sortBy', ['last_name', 'first_name'])
  .then((users) => res.status(200).json(users))
  .catch(next));

module.exports = routes;
