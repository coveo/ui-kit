const {Octokit} = require('@octokit/rest');
const headlessPackageJson = require('../../packages/headless/package.json')
const atomicPackageJson = require('../../packages/atomic/package.json')

const token = process.env.GITHUB_TOKEN || '';
const github = new Octokit({ auth: token });

const owner = 'coveo';
const repo = 'doc_jekyll-public-site';

async function notify(event_type, client_payload) {
  return github.repos.createDispatchEvent({owner, repo, event_type, client_payload});
}

function logError(e) {
  const {status, message, request} = e;
    console.log(status, message, request);
}

async function main() {
  try {
    await notify('published_headless_to_npm', {headless_version: headlessPackageJson.version});
    console.log('headless notification sent');
  } catch(e) {
    console.log('headless notification failed');
    logError(e);
  }

  try {
    await notify('published_atomic_to_npm', {atomic_version: atomicPackageJson.version});
    console.log('atomic notification sent');
  } catch(e) {
    console.log('atomic notification failed');
    logError(e);
  }
}

main();
