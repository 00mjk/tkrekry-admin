'use strict';

var mongoose = require('mongoose'),
    _ = require('lodash'),
    async = require('async'),
    Schema = mongoose.Schema;

mongoose.Promise = require( 'bluebird' );

/**
 * Contact Schema
 */

var ContactSchema = new Schema({
    first_name: {
        type: String
    },
    last_name: {
        type: String
    },
    title: {
        type: String
    },
    email: {
        type: String
    },
    phone: {
        type: String
    },
    employer: {
        type: Schema.ObjectId,
        ref: 'Employer'
    },
    created_at: {
        type: Date
    },
    updated_at: {
        type: Date
    }
});

/**
 * Pre hooks
 */

ContactSchema.pre('save', function(next) {
    this.updated_at = new Date();
    if (!this.created_at) {
        this.created_at = new Date();
    }
    next();
});

ContactSchema.methods = {

};
/**
 * Validations
 */

ContactSchema.statics = {
    all: function(callback) {
        return this.find({})
            .sort('last_name first_name')
            .then(callback);
    },

    get: function(id, callback) {
        return this.findOne({
            '_id': id
        }).then(callback);
    },

    delete: function(id, callback) {
        return this.findOne({
            '_id': id
        }).remove().then(callback);
    },

    findAllByEmployers: function(ids, callback) {
        ids = _.compact(_.isArray(ids) ? ids : [].concat(ids));

        if (ids.length > 0)
            return this.find()
                .where('employer')
                . in (ids)
                .sort('last_name first_name')
                .then(callback);
        else
            return this.find({})
                .sort('last_name first_name')
                .then(callback);
    },

    findByEmployers: function(id, userIds, callback) {
        userIds = _.compact(_.isArray(userIds) ? userIds : [].concat(userIds));

        return this.find()
            .where('employer')
            . in (userIds)
            .where('_id')
            .is(id)
            .then(callback);
    },

    setAllByEmployers: function(employerId, contacts, callback) {
        var self = this;
        this.remove({
            employer: employerId
        }, function(err) {
            if (err) {
                callback(err);
            }

            async.mapSeries(contacts, function(contact, callback) {
                self.create(contact, function(err, _contact) {
                    callback(err, _contact);
                });
            }, function(errors, results) {
                callback(errors, results);
            });

        });
    }
};

ContactSchema.set('toJSON', {
    transform: function(doc, json_response, options) {
        delete json_response.__v;
        return json_response;
    }
});

mongoose.model('Contact', ContactSchema);
