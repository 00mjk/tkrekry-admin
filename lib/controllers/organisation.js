const express = require('express');
const routes = express.Router();
const districts = require('../config/organisation/districts');
const domains = require('../config/organisation/domains');
const job_duration = require('../config/organisation/job_duration');
const job_profession_group = require('../config/organisation/job_profession_group');
const job_type = require('../config/organisation/job_type');

routes.get('/domains',
  (req, res) => res.status(200).json(domains));
routes.get('/districts',
  (req, res) => res.status(200).json(districts));
routes.get('/job_duration',
  (req, res) => res.status(200).json(job_duration));
routes.get('/job_profession_group',
  (req, res) => res.status(200).json(job_profession_group));
routes.get('/job_type',
  (req, res) => res.status(200).json(job_type));

module.exports = routes;
