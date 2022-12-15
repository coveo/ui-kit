import {Octokit} from '@octokit/rest';
import {getPackageDefinitionFromPackageDir} from '../packages.mjs';

const token = process.env.GITHUB_TOKEN || '';
const github = new Octokit({auth: token});

const owner = 'coveo';
const repo = 'doc_jekyll-public-site';
const event_type = 'published_ui-kit_to_npm';

async function notify() {
  const {version: headless_version} =
    getPackageDefinitionFromPackageDir('headless');
  const {version: atomic_version} =
    getPackageDefinitionFromPackageDir('atomic');
  const {version: quantic_version} =
    getPackageDefinitionFromPackageDir('quantic');
  const client_payload = {headless_version, atomic_version, quantic_version};

  return github.repos.createDispatchEvent({
    owner,
    repo,
    event_type,
    client_payload,
  });
}

async function main() {
  try {
    await notify();
    console.log('notification sent');
  } catch (e) {
    const {status, message, request} = e;
    console.error('notification failed', status, message);
    console.log(request);
  }
}

main();
