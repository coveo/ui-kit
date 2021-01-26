const {Octokit} = require('@octokit/rest');
const headlessPackageJson = require('../../packages/headless/package.json')

const token = process.env.GITHUB_TOKEN || '';
const github = new Octokit({ auth: token });

const owner = 'coveo';
const repo = 'doc_jekyll-public-site';
const event_type = 'published_headless_to_npm';


async function notify() {
  const headless_version = headlessPackageJson.version;
  const client_payload = {headless_version};

  return github.repos.createDispatchEvent({owner, repo, event_type, client_payload});
}

async function main() {
  try {
    await notify();
    console.log('notification sent')
  } catch(e) {
    const {status, message, request} = e;
    console.log('notification failed', status, message);
    console.log(request);
  }
}

main();
