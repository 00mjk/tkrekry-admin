const debug = require('debug')('tkrekry:express');
const express = require('express');
const morgan = require('morgan');
const audit = require('express-requests-logger');
const logdna = require('logdna')
const bunyan = require('bunyan')
const bunyanLogdna = require('bunyan-logdna-stream')
const bodyParser = require('body-parser');
const session = require('express-session');
const middleware = require('../middleware');
const RedisStore = require('connect-redis')(session);
const compression = require('compression');
const cookieParser = require('cookie-parser');
const favicon = require('serve-favicon');
const path = require('path');
const config = require('./config');
const passport = require('passport');
const os = require('os');
const env = process.env.NODE_ENV || 'development';

/**
 * Express configuration
 */
module.exports = function (app) {
  debug('running in %s enviroment', env);
  debug('application root is %s', config.root);
  debug('application is running with configuration: %o ', config);

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(cookieParser(process.env.COOKIE_TOKEN || 'secret-cookie-token'));

  app.engine('html', require('ejs').renderFile);
  app.set('view engine', 'html');

  // Persist sessions with mongoStore
  app.use(session({
    store: new RedisStore(config.redis),
    secret: process.env.SESSION_TOKEN || 'session-secret-token-here',
    saveUninitialized: true,
    resave: true
  }));

  app.use(middleware.forceSSL);

  if ('development' === env || 'test' === env || 'docker' === env) {
    app.use(morgan('dev'));
    app.use(express.static(path.join(config.root, '.tmp')));
    app.use(express.static(path.join(config.root, 'app')));
    app.use(favicon(path.join(config.root, 'app', 'favicon.ico')));
    app.set('views', path.join(config.root, 'app', 'views'));
  }

  if ('production' === env || 'staging' === env) {

    var lodgaOptions = {
      hostname: os.hostname(),
      app: 'tkrekry-admin-v2-' + env,
      env: env
  };

    const client = logdna.createLogger(process.env.LOGDNA_KEY, lodgaOptions);
    const stream = new bunyanLogdna.LogDnaStream(client);
    const logger = bunyan.createLogger({
      name: 'tkrekry-admin-v2-' + env,
      streams: [{
        level: 'debug',
        type: 'raw',
        stream: stream
      }]
    });

    app.use(audit({
      audit: true,
      logger: logger,
      excludeURLs: ['bower_components', 'scripts', 'styles', 'views', 'session', 'fonts'],
    }));
    app.use(compression({ threshold: 512 }));
    app.use(morgan('combined'));
    app.use(express.static(path.join(config.root, 'public')));
    app.use(favicon(path.join(config.root, 'public', 'favicon.ico')));
    app.set('views', path.join(config.root, 'views'));
  }

  //use passport session
  app.use(passport.initialize());
  app.use(passport.session());
};
