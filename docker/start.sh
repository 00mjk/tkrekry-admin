#!/usr/bin/env bash

docker run -d -p 27017:27017 --name tkrekry-mongodb dockerfile/mongodb mongod --rest --httpinterface
docker run -d -p 6379:6379 --name tkrekry-redis dockerfile/redis