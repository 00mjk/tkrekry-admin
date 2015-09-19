#!/usr/bin/env bash

docker run -d -p 27017:27017 --name tkrekry-mongodb mongo
docker run -d -p 6379:6379 --name tkrekry-redis redis