

var mongoose = require('mongoose'),
  _ = require('lodash'),
  async = require('async'),
  Schema = mongoose.Schema;

mongoose.Promise = require( 'bluebird' );

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

OfficeSchema.pre('save', function(next) {
  this.updated_at = new Date();
  if (!this.created_at) {
    this.created_at = new Date();
  }
  next();
});

OfficeSchema.statics.all = function(callback) {
  return this.find({}).then(callback);
};

OfficeSchema.statics.get = function(id, callback) {
  return this.findOne({
    '_id': id
  }).then(callback);
};

OfficeSchema.statics.setAllByEmployers = function(employerId, offices, callback) {
  var self = this;
  this.remove({employer: employerId}, function(err) {
    if (err) {
      callback(err);
    }

    async.mapSeries(offices, function(office, callback) {
      self.create(office, function(err, _office) {
        callback(err, _office);
      });
    }, function(errors, results) {
      callback(errors, results);
    });

  });
};

OfficeSchema.statics.findAllByEmployers = function(ids, callback) {
  ids = _.compact(_.isArray(ids) ? ids : [].concat(ids));

  if (ids.length > 0)
    return this.find()
      .where('employer')
      .in (ids)
      .sort('+name')
      .then(callback);
  else
    return this.find({}).sort('+name').then(callback);
};

OfficeSchema.set('toJSON', {
    transform: function(doc, json_response, options) {
        delete json_response.__v;
        return json_response;
    }
});

mongoose.model('Office', OfficeSchema);
