var debug = require( 'debug' )( 'tkrekry:jobs' ),
  config = require( './config' ),
  Agenda = require( 'agenda' ),
  agenda = new Agenda( {
    db: {
      address: config.mongo.uri,
      collection: 'agendaJobs'
    }
  } ),
  mongoose = require( 'mongoose' ),
  Advertisement = mongoose.model( 'Advertisement' );


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

agenda.every( '1 minutes', 'ManageAdvertisements' );

module.exports = agenda;
