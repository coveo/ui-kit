#!/bin/env bash

git config user.name "$CHANGE_AUTHOR"
git config user.email "jenkins@coveo.com"

echo "git checkout $RELEASE_TAG"
git checkout $RELEASE_TAG

echo "git tag -a -f latest -m \"Deploy $RELEASE_TAG\""
git tag -a -f latest -m "Deploy $RELEASE_TAG"
