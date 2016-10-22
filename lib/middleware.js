'use strict';

/**
 * Custom middleware used by the application
 */
module.exports = {

  /**
   *  Protect routes on your api from unauthenticated access
   */
  auth: ( req, res, next ) => {
    if ( req.isAuthenticated( ) ) {
      return next( );
    } else {
      return res.status( 401 ).json({});
    }
  },

  isAdmin: (req, res, next ) => {
    if ( res.user && req.user.role === 'admin') {
      return next( );
    } else {
      return res.status(401).json({});
    }
  },

  /**
   * Set a cookie for angular so it knows we have an http session
   */
  setUserCookie: ( req, res, next ) => {
    if ( req.user ) {
      res.cookie( 'user', JSON.stringify( req.user.userInfo ) );
    }
    return next( );
  },

  disableCache: (req, res, next) => {
    res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.header('Pragma', 'no-cache');
    res.header('Expires', 0);

    return next();
  },

  forceSSL: (req, res, next) => {
    var schema = req.headers['x-forwarded-proto'] || 'https';
    if (schema === 'https') {
      next();
    } else {
      return res.redirect('https://' + req.headers.host + req.url);
    }
  },

  errorHandler: (err, req, res, next) => {
    if (err) {
      return res.status(err.status || 500).json({ error: err.message });
    }

    return next();
  }
};
