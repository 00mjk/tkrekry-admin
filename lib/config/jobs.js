var debug = require( 'debug' )( 'tkrekry:jobs' ),
  config = require( './config' ),
  Agenda = require( 'agenda' ),
  agenda = new Agenda( {
    db: {
      address: config.mongo.uri,
      collection: 'agendaJobs',
      options: config.mongo.server
    }
  } ),
  mongoose = require( 'mongoose' );

mongoose.Promise = require( 'bluebird' );
var Advertisement = mongoose.model( 'Advertisement' );

agenda.define( 'ManageAdvertisements', function ( job, done ) {
  Advertisement.publishWaiting( function ( err, published ) {
    if ( err ) {
      debug( "Error while publishAdvertisements: %o", err );
    }

    debug( "Published advertisements: %o", published);

    Advertisement.unpublishObsolete( function ( err, hidden ) {
      if ( err ) {
        debug( "Error while unpublishAdvertisements: %o", err );
      }

      debug( "Unpublished advertisements: %o", hidden );
      done();
    } );
  } );
} );

module.exports = agenda;
