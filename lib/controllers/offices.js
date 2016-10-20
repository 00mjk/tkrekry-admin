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

mongoose.Promise = require( 'bluebird' );
routes.use(middleware.disableCache);

routes.get( '/', function ( req, res ) {
  sessionFilters.filterByUser( req.user, function ( employers ) {
    if ( employers.length > 0 ) {
      debug( "filtering by %o employers", employers );
    }

    Office.findAllByEmployers( employers, function ( offices ) {
      return res.status( 200 )
        .json( _.sortBy( offices, [ 'name' ] ) );
    } );
  } );
} );

routes.get( '/:id', function ( req, res ) {
  Office.get( req.params.id, function ( employer ) {
    return res.status( 200 )
      .json( employer );
  } );
} );

module.exports = routes;
