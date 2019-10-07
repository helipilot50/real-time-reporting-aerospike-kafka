#!/bin/bash

set -e

docker build -t spark-base ./spark-base
docker build -t spark-master ./spark-master
docker build -t spark-worker ./spark-worker
docker build -t spark-submit ./spark-submit
