'use strict';

var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    debug = require( 'debug' )( 'tkrekry:passport' );

/**
 * Passport configuration
 */
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findOne({
    _id: id
  }, '-salt -hashedPassword', function(err, user) { // don't ever give out the password or salt
    done(err, user);
  });
});

// add other strategies for more authentication flexibility
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password' // this is the virtual field on the model,
  },
  function(email, password, done) {
    User.findOne({
      email: email
    }, function(err, user) {
      if (err) {
        debug( "Authentication failed, unkow error: '%o'", err );
        return done(err);
      }

      if (!user) {
        debug( "Authentication failed, user not found with email: '%s'", email );
        return done(null, false, {
          message: 'Sähköpostiosoite ja/tai salasana väärin.'
        });
      }
      if (!user.authenticate(password)) {
        debug( "Authentication failed, user gave invalid password" );
        return done(null, false, {
          message: 'Sähköpostiosoite ja/tai salasana väärin.'
        });
      }
      return done(null, user);
    });
  }
));

module.exports = passport;