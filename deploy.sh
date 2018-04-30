#!/usr/bin/env bash
BUCKET="liftedsubarus.com"
DIR=build/

cp -a static/. ./build #copy js & css into build
aws  s3  sync $DIR s3://$BUCKET/ --profile personal --acl public-read
