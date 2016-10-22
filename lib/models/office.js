const mongoose = require('mongoose');
const _ = require('lodash');
const Promise = require('bluebird');
const Schema = mongoose.Schema;

mongoose.Promise = Promise;

var OfficeSchema = new Schema({
  name: {
    type: String
  },
  street: {
    type: String
  },
  postal_code: {
    type: String
  },
  locality: {
    type: String
  },
  web_address: {
    type: String
  },
  geo: {
    type: [Number],
    index: '2d'
  },
  employer: {
    type: Schema.ObjectId,
    ref: 'Employer',
    index: true
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

OfficeSchema.pre('save', function (next) {
  this.updated_at = new Date();
  if (!this.created_at) {
    this.created_at = new Date();
  }
  next();
});

OfficeSchema.statics.all = function () {
  return this.find({}).exec();
};

OfficeSchema.statics.get = function (id) {
  return this.findOne({'_id': id}).then((office) => {
    if (office) {
      return Promise.resolve(office);
    } else {
      let error = new Error(`Office not found (${id})`);
      error.status = 404;
      return Promise.reject(error);
    }
  });
};

OfficeSchema.statics.setAllByEmployers = function (employerId, offices) {
  var self = this;
  return this.remove({employer: employerId}).exec().then(() => Promise.map(offices, (office) => self.create(office)));
};

OfficeSchema.statics.findAllByEmployers = function (ids, callback) {
  ids = _.chain(ids).castArray().compact().value();

  if (_.isEmpty(ids)) {
    return this.find({}).sort('+name').exec();
  } else {
    return this.find().where('employer'). in(ids).sort('+name').then(callback);
  }

};

OfficeSchema.set('toJSON', {
  transform: function (doc, json_response, options) {
    delete json_response.__v;
    return json_response;
  }
});

mongoose.model('Office', OfficeSchema);
