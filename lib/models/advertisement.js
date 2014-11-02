'use strict';
var mongoose = require( 'mongoose' ),
  Schema = mongoose.Schema,
  moment = require( 'moment' ),
  _ = require( 'lodash' );
/**
 * Advertisement Schema
 */
var AdvertisementSchema = new Schema( {
  office: {
    type: Object
  },
  contacts: {
    type: [ Schema.Types.Mixed ],
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
} );

/**
 * Pre-save hook
 */
AdvertisementSchema.pre( 'save', function ( next ) {
  this.updated_at = new Date();
  next();
} );

AdvertisementSchema.methods = {
  publish: function ( callback ) {
    this.model( 'Advertisement' )
      .update( {
        _id: this.id
      }, {
        published: true,
        published_at: new Date(),
        publication_day: null
      } )
      .exec( callback );
  },
  unpublish: function ( callback ) {
    this.model( 'Advertisement' )
      .update( {
        _id: this.id
      }, {
        published: false,
        published_at: null,
        publication_day: null
      } )
      .exec( callback );
  }
};

AdvertisementSchema.statics = {
  published: function ( callback ) {
    return this.find( {
        published: true
      } )
      .sort( 'published_at updated_at' )
      .populate( 'employer' )
      .exec( callback );
  },

  publishWaiting: function ( callback ) {
    this.update( {
        publication_day: {
          $lte: new Date()
        },
        published: false
      }, {
        published: true,
        published_at: new Date(),
        publication_day: null
      } )
      .exec( callback );
  },

  unpublishObsolete: function ( callback ) {
    this.update ({
      application_period_end: {
        $lt: new Date()
      },
      published: true
    }, {
      published: false,
      published_at: null
    }).exec( callback );
  },

  all: function ( callback ) {
    return this.find( {} )
      .sort( 'published_at updated_at' )
      .exec( callback );
  },

  get: function ( id, callback ) {
    return this.findOne( {
        '_id': id
      } )
      .exec( callback );
  },

  delete: function ( id, callback ) {
    return this.findOne( {
        '_id': id
      } )
      .remove()
      .exec( callback );
  },

  findAllByEmployers: function ( ids, callback ) {
    ids = _.compact( _.isArray( ids ) ? ids : [].concat( ids ) );

    if ( ids.length > 0 )
      return this.find()
        .sort( 'published_at updated_at' )
        .where( 'employer' )
        .in( ids )
        .populate( 'employer' )
        .exec( callback );
    else
      return this.find( {} )
        .populate( 'employer' )
        .sort( 'published_at updated_at' )
        .exec( callback );
  },

  findByEmployers: function ( id, userIds, callback ) {
    userIds = _.compact( _.isArray( userIds ) ? userIds : [].concat( userIds ) );

    return this.find()
      .where( 'employer' )
      .in( userIds )
      .where( '_id' )
      .is( id )
      .exec( callback );
  }
};

AdvertisementSchema.set( 'toJSON', {
  transform: function ( doc, json_response, options ) {
    delete json_response.__v;
    return json_response;
  }
} );


mongoose.model( 'Advertisement', AdvertisementSchema );
