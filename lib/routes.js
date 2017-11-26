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

  app.get('/config.js', function(req, res) {
    var config = {
      projectId: process.env.KEEN_PROJECT_ID || "5a1aa58dc9e77c0001ae8967",
      writeKey:  process.env.KEEN_WRITE_KEY || "A3A206D326B85209B960AAEFA31EB481E6D9B3A4896A86B416902410D42E096D1C1EE438AAA00A38188F305774EFE83C3D62CFF96DD26EE8892F8E8201E9C9B603309347B8430806AD9DC2D6B5437604E8CBDFF45B5A61386DCF013299990DA2"
    };
    return res.status(200).type('.js').send("window._env_config = " + JSON.stringify(config) + ";");
  });

  app.use('/', index);
};
