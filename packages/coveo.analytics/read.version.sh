#!/bin/bash

if [ "$1" == "" ]
then
    export PACKAGE_JSON_MAJOR_MINOR_PATCH_VERSION=`cat package.json | grep version | head -1 | awk -F: '{ print $2 }' | sed 's/[",]//g' | xargs`
    export PACKAGE_JSON_MAJOR_MINOR_VERSION=`cat package.json | grep version | head -1 | awk -F: '{ print $2 }' | sed 's/[",]//g' | sed -E 's/\.[0-9]+$//g' | xargs`
    export PACKAGE_JSON_MAJOR_VERSION=`cat package.json | grep version | head -1 | awk -F: '{ print $2 }' | sed 's/[",]//g' | sed -E 's/\.[0-9]+\.[0-9]+$//g' | xargs`
elif [ "$1" == "patch" ]
then
 echo `cat package.json | grep version | head -1 | awk -F: '{ print $2 }' | sed 's/[",]//g' | xargs`
elif [ "$1" == "minor" ]
then
 echo `cat package.json | grep version | head -1 | awk -F: '{ print $2 }' | sed 's/[",]//g' | sed -E 's/\.[0-9]+$//g' | xargs`
elif [ "$1" == "major" ]
then
 echo `cat package.json | grep version | head -1 | awk -F: '{ print $2 }' | sed 's/[",]//g' | sed -E 's/\.[0-9]+\.[0-9]+$//g' | xargs`
fi