# TKrekry Admin

Tool for maintaining job advertisements and health center information for http://www.tkrekry.fi/. See http://tkrekry.wordpress.com/2014/11/20/tkrekryn-kehityksesta-ja-tekniikasta/ for more info (in Finnish).

## Statuses

[![Build Status](https://travis-ci.org/tkrekry/tkrekry-admin.svg)](https://travis-ci.org/tkrekry/tkrekry-admin)
[![dependencies](https://david-dm.org/tkrekry/tkrekry-admin.png)](https://david-dm.org/tkrekry/tkrekry-admin)
[![Code Climate](https://codeclimate.com/github/tkrekry/tkrekry-admin/badges/gpa.svg)](https://codeclimate.com/github/tkrekry/tkrekry-admin)
[![Known Vulnerabilities](https://snyk.io/test/github/tkrekry/tkrekry-admin/badge.svg?targetFile=package.json)](https://snyk.io/test/github/tkrekry/tkrekry-admin?targetFile=package.json) [![Greenkeeper badge](https://badges.greenkeeper.io/tkrekry/tkrekry-admin.svg)](https://greenkeeper.io/)

## Development

### Setup

Local development environment is using Docker for MongoDB and Redis.

#### Dependencies

* Install docker https://docs.docker.com/installation/
* Install project dependencies
```bash

  npm install -g grunt-cli bower

  docker-compose build

```

### Start development environment

```bash
  # Start App
  docker-compose up -d

  # Seed development
  scripts/seed-development.sh

  # Stsart local server
  node server.js
  
  # Open browser
  open http://dockerhost:9000

  # Login in
  # as admin admin@example.com / password
  # as normal normal@example.com / password
```

### Run tests

```bash
  # Start Mongodb and Redis containers
  docker-compose up -d

  # Run REST API tests
  DEBUG=tkrekry* grunt env:local_test test:server

  # Install selenium driver first
  DEBUG=tkrekry* grunt shell:protractor_install

  # Run browser tests
  DEBUG=tkrekry* grunt env:local-test test:client
```



## Contributing

Check open issues from https://github.com/tkrekry/tkrekry-admin/issues
Fork the project and create pull request.
https://help.github.com/articles/using-pull-requests/
