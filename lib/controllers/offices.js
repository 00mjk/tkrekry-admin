'use strict';

var debug = require( 'debug' )( 'tkrekry:controllers:offices' ),
  express = require( 'express' ),
  middleware = require( '../middleware' ),
  routes = express.Router(),
  mongoose = require( 'mongoose' ),
  Office = mongoose.model( 'Office' ),
  _ = require( 'lodash' ),
  User = mongoose.model( 'User' ),
  sessionFilters = require( './session' );

routes.use(middleware.disableCache);

routes.get( '/', function ( req, res ) {
  sessionFilters.filterByUser( req.user, function ( err, employers ) {
    if ( err ) {
      debug( "error %o while trying to find all", err );
      return res.status( 500 )
        .json();
    }

    if ( employers.length > 0 ) {
      debug( "filtering by %o employers", employers );
    }

    Office.findAllByEmployers( employers, function ( err, offices ) {
      return res.status( 200 )
        .json( _.sortByAll( offices, [ 'name' ] ) );
    } );
  } );
} );

routes.get( '/:id', function ( req, res ) {
  Office.get( req.params.id, function ( err, employer ) {
    if ( err ) {
      debug( "error %o while trying to find with '%s'", err, req.params.id );
      return res.status( 500 )
        .json();
    }

    return res.status( 200 )
      .json( employer );
  } );
} );

module.exports = routes;
