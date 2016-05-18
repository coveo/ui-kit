#!/bin/env bash

echo "git checkout $RELEASE_TAG"
git checkout $RELEASE_TAG

echo "git tag -a -f latest -m \"Deploy $RELEASE_TAG\""
git tag -a -f latest -m "Deploy $RELEASE_TAG"
