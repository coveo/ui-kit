import {Octokit} from '@octokit/rest';
import {resolve} from 'path';
import {getPackageFromPath, workspacesRoot} from '../packages.mjs';

const headlessPackageJson = getPackageFromPath(
  resolve(workspacesRoot, 'packages', 'headless', 'package.json')
);
const atomicPackageJson = getPackageFromPath(
  resolve(workspacesRoot, 'packages', 'atomic', 'package.json')
);
const quanticPackageJson = getPackageFromPath(
  resolve(workspacesRoot, 'packages', 'quantic', 'package.json')
);

const token = process.env.GITHUB_TOKEN || '';
const github = new Octokit({auth: token});

const owner = 'coveo';
const repo = 'doc_jekyll-public-site';
const event_type = 'published_ui-kit_to_npm';

async function notify() {
  const headless_version = headlessPackageJson.version;
  const atomic_version = atomicPackageJson.version;
  const quantic_version = quanticPackageJson.version;
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
