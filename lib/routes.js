'use strict';

var contacts = require('./controllers/contacts'),
    offices = require('./controllers/offices'),
    advertisements = require('./controllers/advertisements'),
    employers = require('./controllers/employers'),
    users = require('./controllers/users'),
    organisation = require('./controllers/organisation'),
    session = require('./controllers/session'),
    index = require('./controllers');

/**
 * Application routes
 */
module.exports = function(app) {
  // Server API Routes
  app.use('/api/contacts', contacts);
  app.use('/api/advertisements', advertisements);
  app.use('/api/employers', employers);
  app.use('/api/offices', offices);
  app.use('/api/users', users);
  app.use('/api/organisation', organisation);
  app.use('/api/session', session.routes);

  // All undefined api routes should return a 404
  app.get('/api/*', function(req, res) {
    return res.status(404).end();
  });


  app.use('/', index);
};
