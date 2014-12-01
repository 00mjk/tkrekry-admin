# TKrekry Admin

Tool for maintaining job advertisements and health center information for http://www.tkrekry.fi/

## Development

### Setup

Local development environment is using Docker for MongoDB and Redis.

#### Dependencies

* Install nodejs 0.10.x http://nodejs.org/ or https://github.com/creationix/nvm
* Install docker https://docs.docker.com/installation/
* Add dockerhost to /etc/hosts
```bash
  # Linux
  127.0.0.1  dockerhost

  # OSX with boot2docker
  192.168.59.103  dockerhost
```
* Install project dependencies
```bash
  npm install -g grunt-cli bower
  npm install
```

### Start development environment

```bash
  # Start Mongodb and Redis containers
  docker/start.sh

  # Ensure that mongodb and redis are running
  docker ps

  # Seed development
  scripts/seed-development.sh

  # Start app
  DEBUG=tkrekry:* grunt serve

  # Open browser
  open http://localhost:9000

  # Login in
  # as admin admin@example.com / password
  # as normal normal@example.com / password
```

## Contributing

Check open issues from https://github.com/tkrekry/tkrekry-admin/issues
Fork the project and create pull request.
https://help.github.com/articles/using-pull-requests/

