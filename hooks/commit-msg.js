#!/usr/bin/env node
/* eslint-disable no-process-exit */
/* eslint-disable node/shebang */
'use strict';

const childProcess = require('child_process');
const fs = require('fs');
const os = require('os');
const urlBase = 'https://coveord.atlassian.net/browse/';
const projectAcronym = 'KIT';
const {lintCommitMessage} = require('./commit-lint');

let issueNumber;
const branchName = childProcess
  .execSync('git symbolic-ref --short HEAD', {encoding: 'utf8'})
  .trim();
const issueRegex = new RegExp(projectAcronym + '-[\\d]+', 'i');

const match = branchName.match(issueRegex);
if (match) {
  issueNumber = match[0].toUpperCase();
} else {
  console.log(
    `Could not find JIRA issue in branch name. Is your branch named ${projectAcronym}-<jira number>?`
  );
  process.exit();
}

const commitMessageFilename = '.git/COMMIT_EDITMSG';
const commitMessage = fs.readFileSync(commitMessageFilename, {
  encoding: 'utf8',
});

function commitHasIssue(commitMessage) {
  const urlIssueRegex = new RegExp(urlBase + issueRegex.source);
  return commitMessage.search(urlIssueRegex) !== -1;
}

function commitHasIssueNumber(commitMessage, issueNumber) {
  return commitMessage.indexOf(urlBase + issueNumber) !== -1;
}

async function main() {
  try {
    await lintCommitMessage(commitMessage);
    if (commitHasIssueNumber(commitMessage, issueNumber)) {
      process.exit(0);
    }

    if (commitHasIssue(commitMessage)) {
      console.log(
        "Oops... Branch name and issue in commit message don't match"
      );
      process.exit(1);
    }

    fs.appendFileSync(commitMessageFilename, os.EOL + urlBase + issueNumber);
    console.log(`Appended ${urlBase}${issueNumber} to commit message`);
  } catch (e) {
    console.log('!!!');
    console.log(e);
    console.log('!!!');
    throw e;
  }
}

main()
  .then(() => {

    
    process.exit(1);
  })
  .catch(() => process.exit(1));
