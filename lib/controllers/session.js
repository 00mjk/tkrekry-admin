'use strict';

var debug = require( 'debug' )( 'tkrekry:controllers:session' ),
    express = require( 'express' ),
    routes = express.Router(),
    mongoose = require('mongoose'),
    Employer = mongoose.model('Employer'),
    _ = require('lodash'),
    passport = require('passport');

/**
 * Login
 */
routes.post('/', function (req, res, next) {
    passport.authenticate('local', {
        badRequestMessage: 'Sähköpostiosoite ja/tai salasana väärin.'
    }, function(err, user, info) {
        var error = err || info;
        if (error){
            return res.status(401).json(error);
        }

        req.logIn(user, function(err) {
            if (err) {
                return res.status(401).json(err);
            } else {
                res.status(200).json(req.user.userInfo);
            }
        });
    })(req, res, next);
});

/**
 * Logout
 */
routes.delete('/', function (req, res, next) {
    req.logout();
    res.status(200).json({logout: 'done'});
});

module.exports.routes = routes;

/**
 * Auth required
 */

module.exports.filterByUser = function(user, callback) {
    if (user) {
        if (user.role && user.role === 'admin') {
            Employer.find({}, '_id', function(err, employers) {
                callback(err, employers);
            });
        } else {
            callback(null, user.employers);
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
            Employer.existingIds(targetEmployers, function(err, foundEmployer) {
                callback(foundEmployer.length === targetEmployers.length);
            });
        } else {
            var userEmployers = _.map(user.employers, document_id_to_string);
            var contains = _.intersection(targetEmployers, userEmployers).length === targetEmployers.length;
            callback(contains);
        }
    } else {
        callback(false);
    }
};
