'use strict';

var debug = require( 'debug' )( 'tkrekry:controllers:session' ),
    express = require( 'express' ),
    routes = express.Router(),
    mongoose = require('mongoose'),
    Employer = mongoose.model('Employer'),
    _ = require('lodash'),
    passport = require('passport');

mongoose.Promise = require( 'bluebird' );

/**
 * Login
 */
routes.post('/', function (req, res, next) {
    passport.authenticate('local', {
        badRequestMessage: 'Sähköpostiosoite ja/tai salasana väärin.'
    }, function(error, user) {

        if (error){
          return res.status(401).json(error);
        }

        req.logIn(user, function(err) {
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

module.exports.filterByUser = function(user, callback) {
    if (user) {
        if (user.role && user.role === 'admin') {
            Employer.find({}, '_id').then(function(employers) {
                callback(employers);
            });
        } else {
            callback(user.employers);
        }
    } else {
        callback(null);
    }
};

var document_id_to_string = function(document_id) {
    return document_id.toString();
};

module.exports.isAllowed = function(user, targetEmployers, callback) {
    targetEmployers = _.chain(_.isArray(targetEmployers) ? targetEmployers : [].concat(targetEmployers)).compact().map(document_id_to_string).uniq().value();

    if (user && targetEmployers.length > 0) {
        if (user.role && user.role === 'admin') {
            Employer.existingIds(targetEmployers, function(foundEmployer) {
                var existingEmployerIds = _.map(foundEmployer, '_id').map(document_id_to_string);
                callback(_.isEqual(existingEmployerIds, targetEmployers));
            });
        } else {
            var userEmployers = _.map(user.employers, document_id_to_string);
            callback(_.isEqual(targetEmployers, userEmployers));
        }
    } else {
        callback(false);
    }
};
