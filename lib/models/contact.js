const mongoose = require('mongoose');
const Promise = require('bluebird');
const _ = require('lodash');
const Schema = mongoose.Schema;

mongoose.Promise = Promise;

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

ContactSchema.pre('save', function (next) {
  this.updated_at = new Date();
  if (!this.created_at) {
    this.created_at = new Date();
  }
  next();
});

ContactSchema.methods = {};
/**
 * Validations
 */

ContactSchema.statics = {
  all: function () {
    return this.find({}).sort('last_name first_name').exec();
  },

  get: function (id) {
    const notFoundError = (id) => {
      let error = new Error(`Contact not found (${id})`);
      error.status = 404;
      return error;
    };
    return this.findOne({ '_id': id }).then((contact) => {
      if (contact) {
        return Promise.resolve(contact);
      } else {
        return Promise.reject(notFoundError(id));
      }
    }).catch((error) => {
      error.status = 404;
      return Promise.reject(notFoundError(id));
    });
  },

  delete: function (id) {
    return this.findOne({ '_id': id }).remove().exec();
  },

  findAllByEmployers: function (ids) {
    ids = _.chain(ids).castArray().compact().value();

    if (_.isEmpty(ids))
      return this.find({}).sort('last_name first_name').exec();
    else
      return this.find().where('employer').in(ids).sort('last_name first_name').exec();
  },

  findByEmployers: function (id, userIds, callback) {
    userIds = _.chain(userIds).castArray().compact().value();

    return this.find().where('employer').in(userIds).where('_id').is(id).exec();
  },

  setAllByEmployers: function (employerId, contacts) {
    var self = this;
    return this.remove({ employer: employerId }).exec().then(() => Promise.map(contacts, (contact) => self.create(contact)));
  }
};

ContactSchema.set('toJSON', {
  transform: function (doc, json_response, options) {
    delete json_response.__v;
    return json_response;
  }
});

mongoose.model('Contact', ContactSchema);
