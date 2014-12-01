#!/usr/bin/env bash

docker ps -a | grep 'tkrekry-mongodb' | awk '{print $1}' | xargs docker stop
docker ps -a | grep 'tkrekry-mongodb' | awk '{print $1}' | xargs docker rm

docker ps -a | grep 'tkrekry-redis' | awk '{print $1}' | xargs docker stop
docker ps -a | grep 'tkrekry-redis' | awk '{print $1}' | xargs docker rm