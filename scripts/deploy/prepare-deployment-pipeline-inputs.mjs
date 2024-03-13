import {context} from '@actions/github';
import {execSync} from 'child_process';
import {parse} from 'semver';
import atomicHostedPageJson from '../../packages/atomic-hosted-page/package.json' assert {type: 'json'};
import atomicReactJson from '../../packages/atomic-react/package.json' assert {type: 'json'};
import atomicJson from '../../packages/atomic/package.json' assert {type: 'json'};
import headlessJson from '../../packages/headless/package.json' assert {type: 'json'};
import { setOutput } from '@actions/core';

const releaseCommit = execSync('git rev-parse HEAD').toString().trim();

function getVersionComposants(version) {
  const parsedVersion = parse(version);
  return {
    major: parsedVersion?.major,
    minor: parsedVersion?.minor,
    patch: parsedVersion?.patch,
  };
}

const headless = getVersionComposants(headlessJson.version);
const atomic = getVersionComposants(atomicJson.version);
const atomicReact = getVersionComposants(atomicReactJson.version);
const atomicHostedPage = getVersionComposants(atomicHostedPageJson.version);
setOutput('HEADLESS_MAJOR_VERSION', headless.major);
setOutput('HEADLESS_MINOR_VERSION', headless.minor);
setOutput('HEADLESS_PATCH_VERSION', headless.patch);
setOutput('ATOMIC_MAJOR_VERSION', atomic.major);
setOutput('ATOMIC_MINOR_VERSION', atomic.minor);
setOutput('ATOMIC_PATCH_VERSION', atomic.patch);
setOutput('ATOMIC_REACT_MAJOR_VERSION', atomicReact.major);
setOutput('ATOMIC_REACT_MINOR_VERSION', atomicReact.minor);
setOutput('ATOMIC_REACT_PATCH_VERSION', atomicReact.patch);
setOutput('ATOMIC_HOSTED_PAGE_MAJOR_VERSION', atomicHostedPage.major);
setOutput('ATOMIC_HOSTED_PAGE_MINOR_VERSION', atomicHostedPage.minor);
setOutput('ATOMIC_HOSTED_PAGE_PATCH_VERSION', atomicHostedPage.patch);
setOutput('GITHUB_RUN_ID', context.runId);
setOutput('RELEASE_COMMIT', releaseCommit);
