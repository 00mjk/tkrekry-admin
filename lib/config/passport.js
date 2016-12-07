const mongoose = require('mongoose');
const User = mongoose.model('User');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const debug = require('debug')('tkrekry:passport');
const Promise = require('bluebird');

mongoose.Promise = Promise;

/**
 * Passport configuration
 */
passport.serializeUser((user, done) => {
  if (user) {
    done(null, user.id);
  } else {
    let error = new Error(`Invalid user session.`);
    error.status = 403;
    done(error);
  }
});

passport.deserializeUser((id, done) =>
  User.findOne({ _id: id }, '-salt -hashedPassword').exec()
    .then((user) => done(null, user))
    .catch((error) => done(error, null)));

// add other strategies for more authentication flexibility
passport.use(new LocalStrategy({
  usernameField: 'email', passwordField: 'password' // this is the virtual field on the model,
}, function (email, password, done) {
  User.findOne({ email: email }).exec().then(function (user) {
    if (!user) {
      debug("Authentication failed, user not found with email: '%s'", email);
      return done(null, false, { message: 'Sähköpostiosoite ja/tai salasana väärin.' });
    }
    if (!user.authenticate(password)) {
      debug("Authentication failed, user gave invalid password");
      return done(null, false, { message: 'Sähköpostiosoite ja/tai salasana väärin.' });
    }
    return done(null, user);
  }).catch((error) => done(null, false, { message: 'Sähköpostiosoite ja/tai salasana väärin.' }));
}));

module.exports = passport;
