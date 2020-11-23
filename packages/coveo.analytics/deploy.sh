#!/bin/env bash

git config user.name "via Jenkins"
git config user.email "jenkins@coveo.com"

echo "> git checkout $RELEASE_TAG"
git checkout $RELEASE_TAG

echo "> git tag -a -f latest -m \"Deploy $RELEASE_TAG\""
git tag -a -f latest -m "Deploy $RELEASE_TAG"

echo "> git push --force --tags \"https://${GH_TOKEN}@github.com/coveo/coveo.analytics.js.git\" > /dev/null 2>&1"
git push --force --tags "https://${GH_TOKEN}@github.com/coveo/coveo.analytics.js.git" > /dev/null 2>&1
