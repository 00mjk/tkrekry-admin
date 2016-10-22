const mongoose = require('mongoose');
const _ = require('lodash');
const inspect = require('util').inspect;
const Schema = mongoose.Schema;

mongoose.Promise = require( 'bluebird' );

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
    linkContact: function(contact) {
        return this.update(
          { $push: { contacts: contact } },
          { upsert: true }
        )
        .exec();
    },

    linkOffice: function(office, callback) {
        return this.update(
          { $push: { offices: office } },
          { upsert: true })
        .exec();
    }
};

EmployerSchema.statics = {
    all: function(callback) {
        return this.find({})
            .sort('+name')
            .exec();
    },

    get: function(id) {
      const notFoundError = (id) => {
        let error = new Error(`Employer not found (${id})`);
        error.status = 404;
        return error;
      };

      return this.findOne({ '_id': id })
        .then((employer) => {
          if (employer) {
            return Promise.resolve(employer);
          } else {
            return Promise.reject(notFoundError(id));
          }
        })
        .catch((error) => {
          error.status = 404;
          return Promise.reject(notFoundError(id));
        });
    },

    delete: function(id, callback) {
        return this.findOne({
            '_id': id
        }).remove().exec();
    },

    findAllByEmployers: function(ids) {
        ids = _.chain(ids).castArray().compact().value();

        if (_.isEmpty(ids))
          return this.find({})
            .sort('+name')
            .populate('contacts')
            .populate('offices')
            .exec();
        else
          return this.find()
            .sort('+name')
            .where('_id')
            .in(ids)
            .populate('contacts')
            .populate('offices')
            .exec();
    },

    existingIds: function(ids) {
        ids = _.chain(ids).castArray().compact().value();
        return this.find()
            .where('_id')
            .in(ids)
            .select('_id name')
            .exec();
    },

    findByEmployers: function(id, userIds) {
        userIds = _.chain(userIds).castArray().compact().value();

        return this.find()
            .where('employer')
            .in(userIds)
            .where('_id')
            .is(id)
            .populate('contacts')
            .populate('offices')
            .exec();
    }
};

EmployerSchema.set('toJSON', {
    transform: function(doc, json_response, options) {
        delete json_response.__v;
        return json_response;
    }
});

mongoose.model('Employer', EmployerSchema);
