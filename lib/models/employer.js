'use strict';

var mongoose = require('mongoose'),
    _ = require('lodash'),
    inspect = require('util').inspect,
    Schema = mongoose.Schema;

var EmployerSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    short_name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    domain: {
        type: Object,
        required: true
    },
    district: {
        type: Object,
        required: true
    },
    general_presentation: {
        type: String,
        default: ''
    },
    training_presentation: {
        type: String,
        default: ''
    },
    suitable_for_specialization: {
        type: Boolean,
        required: true,
        default: false
    },
    general_presentation_link: {
        type: String,
        default: ''
    },
    offices: [{
        type: Schema.ObjectId,
        ref: 'Office'
    }],
    contacts: [{
        type: Schema.ObjectId,
        ref: 'Contact'
    }],
    advertisement_count: {
        type: Number,
        default: 0
    },
    latest_advertisement: {
        type: Date
    },
    last_user_login: {
        type: Date
    },
    last_office_update: {
        type: Date
    },
    last_contact_update: {
        type: Date
    },
    created_at: {
        type: Date,
        default: new Date()
    },
    updated_at: {
        type: Date
    }
});

/**
 * Pre hooks
 */

EmployerSchema.pre('save', function(next) {
    var now = new Date();

    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }

    next();
});

EmployerSchema.methods = {
    linkContact: function(contact, callback) {
        this.update({
            $push: {
                contacts: contact
            }
        }, {
            upsert: true
        }, callback);
    },

    linkOffice: function(office, callback) {
        this.update({
            $push: {
                offices: office
            }
        }, {
            upsert: true
        }, callback);
    }
};

EmployerSchema.statics = {
    all: function(callback) {
        return this.find({})
            .sort('+name')
            .exec(callback);
    },

    get: function(id, callback) {
        return this.findOne({
            '_id': id
        }).exec(callback);
    },

    delete: function(id, callback) {
        return this.findOne({
            '_id': id
        }).remove().exec(callback);
    },

    findAllByEmployers: function(ids, callback) {
        ids = _.compact(_.isArray(ids) ? ids : [].concat(ids));

        if (ids.length > 0)
            return this.find()
                .sort('+name')
                .where('_id')
                . in (ids)
                .populate('contacts')
                .populate('offices')
                .exec(callback);
        else {
            return this.find({}).sort('+name').populate('contacts').populate('offices').exec(callback);
        }
    },

    existingIds: function(ids, callback) {
        ids = _.compact(_.isArray(ids) ? ids : [].concat(ids));
        return this.find()
            .where('_id')
            . in (ids)
            .select('_id name')
            .exec(callback);
    },

    findByEmployers: function(id, userIds, callback) {
        userIds = _.compact(_.isArray(userIds) ? userIds : [].concat(userIds));

        return this.find()
            .where('employer')
            . in (userIds)
            .where('_id')
            .is(id)
            .populate('contacts')
            .populate('offices')
            .exec(callback);
    }
};

EmployerSchema.set('toJSON', {
    transform: function(doc, json_response, options) {
        delete json_response.__v;
        return json_response;
    }
});

mongoose.model('Employer', EmployerSchema);
