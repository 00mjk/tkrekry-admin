const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment');
const Promise = require('bluebird');
const _ = require('lodash');

mongoose.Promise = require('bluebird');

/**
 * Advertisement Schema
 */
var AdvertisementSchema = new Schema({
  office: {
    type: Object
  },
  contacts: {
    type: [Schema.Types.Mixed]
  },
  job_type: {
    type: Object,
    required: true
  },
  job_duration: {
    type: Object,
    required: true
  },
  job_profession_group: {
    type: Object,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  employer: {
    type: Schema.ObjectId,
    ref: 'Employer',
    index: true
  },
  work_begins: {
    type: String
  },
  working_hours: {
    type: String
  },
  application_period_end: {
    type: Date
  },
  application_submission: {
    type: String
  },
  alternative_method: {
    type: String
  },
  publication_day: {
    type: Date
  },
  application_placed_on: {
    type: Date
  },
  published: {
    type: Boolean,
    default: false,
    index: true
  },
  published_at: {
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
 * Pre-save hook
 */
AdvertisementSchema.pre('save', function (next) {
  this.updated_at = new Date();
  next();
});

AdvertisementSchema.methods = {
  publish: function () {
    return this.model('Advertisement').update({
      _id: this.id
    }, {
        published: true,
        published_at: new Date(),
        publication_day: null
      }).exec();
  },
  unpublish: function (callback) {
    return this.model('Advertisement').update({
      _id: this.id
    }, {
        published: false,
        published_at: null,
        publication_day: null
      }).exec();
  }
};

AdvertisementSchema.statics = {
  published: function () {
    return this.find({ published: true }).sort('published_at updated_at').populate('employer').exec();
  },

  publishWaiting: function () {
    return this.update({
      publication_day: {
        $lte: new Date()
      },
      published: false
    }, {
        published: true,
        published_at: new Date(),
        publication_day: null
      }).exec();
  },

  unpublishObsolete: function () {
    return this.update({
      application_period_end: {
        $lt: new Date()
      },
      published: true
    }, {
        published: false,
        published_at: null
      }).exec();
  },

  all: function (callback) {
    return this.find({}).sort('published_at updated_at').exec();
  },

  get: function (id) {
    const notFoundError = (id) => {
      let error = new Error(`Advertisement not found (${id})`);
      error.status = 404;
      return error
    }

    return this.findOne({ '_id': id }).then((advertisement) => {
      if (advertisement) {
        return Promise.resolve(advertisement);
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
    if (_.isEmpty(ids)) {
      return this.find({}).populate('employer').sort('published_at updated_at').exec();
    } else {
      return this.find({}).where('employer').in(ids).populate('employer').sort('published_at updated_at').exec();
    }
  },

  findByEmployers: function (id, userIds) {
    userIds = _.chain(userIds).castArray().compact().value();
    return this.find().where('employer').in(userIds).where('_id').is(id).exec();
  }
};

AdvertisementSchema.set('toJSON', {
  transform: function (doc, json_response, options) {
    delete json_response.__v;
    return json_response;
  }
});

mongoose.model('Advertisement', AdvertisementSchema);
