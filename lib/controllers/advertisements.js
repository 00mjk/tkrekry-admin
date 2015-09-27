'use strict';

var debug = require( 'debug' )( 'tkrekry:controllers:advertisements' ),
  mongoose = require( 'mongoose' ),
  express = require( 'express' ),
  routes = express.Router(),
  middleware = require( '../middleware' ),
  Employer = mongoose.model( 'Employer' ),
  Advertisement = mongoose.model( 'Advertisement' ),
  User = mongoose.model( 'User' ),
  _ = require( 'lodash' ),
  moment = require( 'moment' ),
  sessionFilters = require( './session' );


var transformFiels = function ( advertisement ) {
  var date_fields = [ 'application_period_end', 'publication_day', 'application_placed_on', 'published_at' ];
  return _.transform( advertisement, function ( result, value, key ) {
    if ( _.contains( date_fields, key ) ) {
      if ( _.isDate( value ) ) {
        result[ key ] = value;
        return result;
      }
      if ( _.isString( value ) ) {
        result[ key ] = ( ( moment( value )
          .isValid() && moment( value )
          .utc()
          .format() ) || ( moment( value, 'DD.MM.YYYY' )
          .isValid() && moment( value, 'DD.MM.YYYY' )
          .utc()
          .format() ) );
        return result;
      }
      result[ key ] = null;
      return result;
    } else {
      result[ key ] = value;
      return result;
    }
  } );
};

routes.use(middleware.disableCache);

routes.get( '/published', function ( req, res, next ) {
  Advertisement.published( function ( err, advertisements ) {
    if ( err ) {
      debug( "error %o while trying to find all published", err );
      return res.status( 500 )
        .json({});
    }
    return res.status( 200 )
      .json( _.sortBy( advertisements, 'updated_at' ).value() );
  } );
} );

routes.get( '/', function ( req, res, next ) {
  sessionFilters.filterByUser( req.user, function ( err, employers ) {
    if ( employers && employers.length > 0 ) {
      debug( "filtering by %o employers", employers );
    }

    Advertisement.findAllByEmployers( employers, function ( err, advertisements ) {
      if ( err ) {
        debug( "error %o while trying to find all", err );
        return res.status( 500 ).json(err);
      }

      return res.status( 200 )
        .json( _.sortBy( advertisements, 'updated_at' ).value() );
    } );
  } );
} );

routes.get( '/:id', function ( req, res ) {
  Advertisement.get( req.params.id, function ( err, advertisement ) {
    if ( err ) {
      debug( "error %o while trying to find with '%s'", err, req.params.id );
      return res.status( 500 )
        .json({});
    }

    if ( advertisement ) {
      return res.status( 200 )
        .json( advertisement );
    } else {
      debug( "not found advertisement with id '%s'", req.params.id );
      return res.status( 404 )
        .json({});
    }
  } );
} );

routes.post( '/', middleware.auth, function ( req, res ) {
  sessionFilters.isAllowed( req.user, req.body.employer, function ( allowed ) {
    if ( !allowed ) {
      debug( "%s %s is trying to create advertisement without correct rights", req.user.first_name, req.user.last_name );
      return res.status( 403 )
        .json({});

    }

    var advertisement = new Advertisement( transformFiels( req.body ) );
    advertisement.save( function ( err, data ) {
      if ( err ) {
        debug( "error %o while trying to create %o", err, advertisement );
        res.status( 422 )
          .json( err );
      } else {
        res.status( 200 )
          .json( advertisement );
      }
    } );

  } );
} );

routes.put( '/:id', middleware.auth, function ( req, res ) {
  Advertisement.get( req.params.id, function ( err, advertisement ) {
    if ( err ) {
      debug( "error %o while trying to find advertisement %s for update.", err, req.params.id );
      return res.status( 404 )
        .json({});
    }

    if ( !advertisement ) {
      debug( "trying to find advertisement %s for update, but not found.", err, req.params.id );
      return res.status( 404 )
        .json({});
    }

    var updateAdvertisement = transformFiels( req.body );
    delete updateAdvertisement._id;
    delete updateAdvertisement.__v;
    updateAdvertisement.updated_at = new Date();

    sessionFilters.isAllowed( req.user, [ updateAdvertisement.employer._id, advertisement.employer ], function ( allowed ) {
      if ( !allowed ) {
        debug( "%s %s is trying to update advertisement %s without correct rights", req.user.first_name, req.user.last_name, updateAdvertisement._id );
        return res.status( 403 )
          .json({});
      }

      Advertisement.findByIdAndUpdate( advertisement._id, updateAdvertisement, {
        safe: true,
        upsert: true
      }, function ( err, data ) {
        if ( err ) {
          res.status( 422 )
            .json( err );
        } else {
          res.status( 200 )
            .json({});
        }
      } );
    } );
  } );
} );


routes.delete( '/:id', middleware.auth, function ( req, res ) {
  Advertisement.get( req.params.id, function ( err, advertisement ) {
    if ( err ) {
      debug( "error %o while trying to find advertisement %s for delete.", err, req.params.id );
      return res.status( 404 )
        .json({});
    }

    if ( !advertisement ) {
      debug( "advertisement not found %s for delete.", req.params.id );
      return res.status( 404 )
        .json({});
    }

    sessionFilters.isAllowed( req.user, advertisement.employer, function ( allowed ) {
      if ( !allowed ) {
        debug( "%s %s is trying to delete advertisement %s without correct rights", req.user.first_name, req.user.last_name, advertisement._id );
        return res.status( 403 )
          .json({});
      }

      Advertisement.delete( req.params.id, function ( err, result ) {
        if ( err ) {
          debug( "Advertisement destroy caused error: %o when trying to delete (%s) %s", err, advertisement._id, advertisement.title );
        }

        debug( "Advertisement destroyd: (%s) %s by %s %s", advertisement._id, advertisement.title, req.user.first_name, req.user.last_name );
        res.status( 200 )
          .json( req.params.id );
      } );
    } );
  } );
} );

routes.post( '/:id/publish', middleware.auth, function ( req, res ) {
  Advertisement.get( req.params.id, function ( err, advertisement ) {
    if ( err ) {
      debug( "error %o while trying to find advertisement %s for publish.", err, req.params.id );
      return res.status( 404 )
        .json({});
    }

    if ( !advertisement ) {
      debug( "advertisement not found %s for publish.", req.params.id );
      return res.status( 404 )
        .json({});
    }

    sessionFilters.isAllowed( req.user, advertisement.employer, function ( allowed ) {
      if ( !allowed ) {
        debug( "%s %s is trying to publish advertisement %s without correct rights", req.user.first_name, req.user.last_name, advertisement._id );
        return res.status( 403 )
          .json({});
      }

      advertisement.publish( function ( err, result ) {
        if ( err ) {
          debug( "Advertisement publishing caused error: %o when trying to delete (%s) %s", err, advertisement._id, advertisement.title );
        }

        debug( "Advertisement published: (%s) %s by %s %s ", advertisement._id, advertisement.title, req.user.first_name, req.user.last_name );
        return res.status( 200 )
          .json( advertisement );
      } );
    } );
  } );
} );

routes.post( '/:id/unpublish', middleware.auth, function ( req, res ) {
  Advertisement.get( req.params.id, function ( err, advertisement ) {
    if ( err ) {
      debug( "error %o while trying to find advertisement %s for unpublish.", err, req.params.id );
      return res.status( 404 )
        .json({});
    }

    if ( !advertisement ) {
      debug( "advertisement not found %s for unpublish.", req.params.id );
      return res.status( 404 )
        .json({});
    }

    sessionFilters.isAllowed( req.user, advertisement.employer, function ( allowed ) {
      if ( !allowed ) {
        debug( "%s %s is trying to publish advertisement %s without correct rights", req.user.first_name, req.user.last_name, advertisement._id );
        return res.status( 403 )
          .json({});
      }
      advertisement.unpublish( function ( err, result ) {
        if ( err ) {
          debug( "Advertisement unpublish caused error: %o when trying to delete (%s) %s", err, advertisement._id, advertisement.title );
          return res.status( 500 )
            .json({});
        }

        debug( "Advertisement unpublish: (%s) %s by %s %s", advertisement._id, advertisement.title, req.user.first_name, req.user.last_name );
        return res.status( 200 )
          .json( advertisement );
      } );
    } );
  } );
} );

module.exports = routes;
