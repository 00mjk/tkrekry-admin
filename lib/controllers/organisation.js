'use strict';

var debug = require( 'debug' )( 'tkrekry:controllers:organisation' ),
    express = require( 'express' ),
    routes = express.Router(),
    districts = require('../config/organisation/districts'),
    domains = require('../config/organisation/domains'),
    job_duration = require('../config/organisation/job_duration'),
    job_profession_group = require('../config/organisation/job_profession_group'),
    job_type = require('../config/organisation/job_type');

routes.get('/domains', function (req, res) {
  return res.status( 200 ).json( domains );
});

routes.get('/districts', function (req, res) {
	return res.status( 200 ).json( districts );
});

routes.get('/job_duration', function (req, res) {
	return res.status( 200 ).json( job_duration );
});

routes.get('/job_profession_group', function (req, res) {
	return res.status( 200 ).json( job_profession_group );
});

routes.get('/job_type', function (req, res) {
  return res.status( 200 ).json( job_type );
});

module.exports = routes;
