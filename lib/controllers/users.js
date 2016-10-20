'use strict';

var debug = require( 'debug' )( 'tkrekry:controllers:users' ),
  express = require( 'express' ),
  middleware = require( '../middleware' ),
  routes = express.Router(),
  mongoose = require( 'mongoose' ),
  Office = mongoose.model( 'Office' ),
  User = mongoose.model( 'User' ),
  _ = require( 'lodash' ),
  User = mongoose.model( 'User' ),
  nodeExcel = require('excel-export'),
  passport = require( 'passport' ),
  moment = require( 'moment' ),
  sessionFilters = require( './session' );

mongoose.Promise = require( 'bluebird' );
routes.use(middleware.disableCache);

/**
 * Get current user
 */
routes.get('/me', middleware.auth, function ( req, res ) {
  res.json( req.user || null );
});

/**
 * List user
 */
routes.get('/report', middleware.auth, function ( req, res, next ) {
  if ( req.user.role === 'admin' ) {
    var conf = {};
    conf.cols = [ {
      caption: 'Etunimi',
      type: 'string'
    }, {
      caption: 'Sukunimi',
      type: 'string'
    }, {
      caption: 'Puhelin',
      type: 'string'
    }, {
      caption: 'Sähköposti',
      type: 'string'
    }, {
      caption: 'Varasähköposti',
      type: 'string'
    }, {
      caption: 'Viimeksi kirjautunut',
      type: 'string',
    }, {
      caption: 'Kaikkiaan kirjautunut',
      type: 'number'
    }, {
      caption: 'Rooli',
      type: 'string'
    }, {
      caption: 'Työnantajat',
      type: 'string'
    }, {
      caption: 'Sairaanhoitopiiri',
      type: 'string'
    }];

    User.find({}).populate('employers').exec(function ( err, users ) {
      if ( err ) {
        return res.status( 500 ).json( err );
      }

      conf.rows = _.map( users, function ( user ) {
        var employers = _.compact(_.map(user.employers, 'name')),
            domain = _.compact(_.map(user.employers, 'domain'));

        var domainName = (_.isEmpty(domain) ? 'Tyhjä' : _.map(domain, 'name').join(', ')),
            employerName = (_.isEmpty(employers) ? 'Tyhjä' : employers.join(', '));

        return [(user.first_name || 'Puutuu'),
                (user.last_name || 'Puutuu'),
                (user.phone || 'Puutuu'),
                (user.email || 'Puutuu'),
                (user.fallback_email || 'Puutuu'),
                (user.last_login + '' || 'Puutuu'),
                (user.login_count || 0),
                (user.role || 'Puutuu'),
                (employerName || 'Puutuu'),
                (domainName || 'Puutuu')].toArray();
      }).toArray();

      var result = nodeExcel.execute( conf );
      res.setHeader( 'Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' );
      res.setHeader( 'Content-Disposition', 'attachment; filename=' + 'user-report.xlsx' );
      return res.end( result, 'binary' );

    } );
  } else {
    return res.status( 403 ).json({});
  }
});


/**
 * Create user
 */
routes.post('/', middleware.auth, function ( req, res, next ) {
  if ( req.user.role === 'admin' ) {
    var newUser = new User( req.body );
    newUser.provider = 'local';
    newUser.save( function ( err ) {
      if ( err )
        return res.status( 400 )
          .json( err );
      else
        return res.status( 200 )
          .json( newUser );
    } );
  } else {
    return res.status( 403 )
      .json( {} );
  }
});

/**
 * Destroy user
 */
routes.delete('/:id', middleware.auth, function ( req, res, next ) {
  var userId = req.params.id;

  if ( req.user.role === 'admin' && req.user._id !== userId ) {
    User.remove( {
      _id: userId
    }, function ( err, user ) {
      if ( err ) {
        return res.status( 400 )
          .json( err );
      } else {
        return res.status( 200 )
          .json( user );
      }
    } );
  } else {
    return res.status( 403 )
      .json( {
        error: 403
      } );
  }
});


/**
 *  Get profile of specified user
 */
routes.get('/:id', middleware.auth, function ( req, res, next ) {
  var userId = req.params.id;

  User.findById( userId ).exec().then(function ( err, user ) {
    if ( err ) return next( err );
    if ( !user ) return res.send( 404 );

    res.send( 200, {
      profile: user.userInfo
    } );
  } );
});

/**
 * Change password
 */
routes.put('/:id', middleware.auth, function ( req, res, next ) {
  var userId;

  if ( req.user.role === 'admin' ) {
    userId = req.params.id;
  } else {
    userId = req.user._id;
  }

  var currentPassword = req.body.current_password,
    newPass = req.body.new_password,
    firstName = req.body.first_name,
    lastName = req.body.last_name,
    phone = req.body.phone,
    fallbackEmail = req.body.fallback_email,
    employers = req.body.employers,
    role = req.body.role;

  User.findById( userId, function ( err, user ) {
    if ( err || !user ) {
      return res.status( 404 )
        .json( err );
    }

    if ( req.user.role === 'admin' ||  user.authenticate( currentPassword ) ) {

      if ( req.user.role === 'admin' ) {
        if ( _.isArray( employers ) && employers.length > 0 ) {
          var updateEmployers = _.map( employers, '_id' );
          user.employers = updateEmployers;
        } else {
          user.employers = [];
        }

        user.role = role;
      }

      if ( newPass && newPass.length > 12 ) {
        if ( req.user.role === 'admin' ) {
          console.log( "Admin ", req.user.email, " changed user's", user.email, "(", user.first_name, user.last_name, ") password at", new Date() );
          user.password = newPass;
        } else {
          if ( newPass !== currentPassword ) {
            console.log( "User", user.email, "(", user.first_name, user.last_name, ") changed password at", new Date() );
            user.password = newPass;
          }
        }
      }

      user.first_name = firstName;
      user.last_name = lastName;
      user.phone = phone;
      user.fallback_email = fallbackEmail;

      user.save( function ( err ) {
        if ( err ) {
          return res.status( 400 )
            .json( err );
        }

        res.status( 200 )
          .json({});
      } );
    } else {
      res.status( 403 )
        .json({});
    }
  } );
});

routes.get('/', middleware.auth, function ( req, res, next ) {
  User.find( {}, function ( err, users ) {
    if ( err ) return res.send( 400 );

    res.status( 200 )
      .json( _.sortBy( _.map( users, function ( user ) {
        return user.userInfo;
      } ), [ "last_name", "first_name" ] ) );
  } );
});

module.exports = routes;
