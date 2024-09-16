import {execSync} from 'node:child_process';
import {parse} from 'semver';
import atomicHostedPageJson from '../../packages/atomic-hosted-page/package.json' assert {type: 'json'};
import atomicReactJson from '../../packages/atomic-react/package.json' assert {type: 'json'};
import atomicJson from '../../packages/atomic/package.json' assert {type: 'json'};
import headlessJson from '../../packages/headless/package.json' assert {type: 'json'};

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
console.log(execSync(`
  deployment-package package create --with-deploy \
    --resolve HEADLESS_MAJOR_VERSION=${headless.major} \
    --resolve HEADLESS_MINOR_VERSION=${headless.major}.${headless.minor} \
    --resolve HEADLESS_PATCH_VERSION=${headless.major}.${headless.minor}.${headless.patch} \
    --resolve ATOMIC_MAJOR_VERSION=${atomic.major} \
    --resolve ATOMIC_MINOR_VERSION=${atomic.major}.${atomic.minor} \
    --resolve ATOMIC_PATCH_VERSION=${atomic.major}.${atomic.minor}.${atomic.patch} \
    --resolve ATOMIC_REACT_MAJOR_VERSION=${atomicReact.major} \
    --resolve ATOMIC_REACT_MINOR_VERSION=${atomicReact.major}.${atomicReact.minor} \
    --resolve ATOMIC_REACT_PATCH_VERSION=${atomicReact.major}.${atomicReact.minor}.${atomicReact.patch} \
    --resolve ATOMIC_HOSTED_PAGE_MAJOR_VERSION=${atomicHostedPage.major} \
    --resolve ATOMIC_HOSTED_PAGE_MINOR_VERSION=${atomicHostedPage.major}.${atomicHostedPage.minor} \
    --resolve ATOMIC_HOSTED_PAGE_PATCH_VERSION=${atomicHostedPage.major}.${atomicHostedPage.minor}.${atomicHostedPage.patch} \
    --resolve GITHUB_RUN_ID=${process.env.RUN_ID} \
    --changeset ${releaseCommit}`.replaceAll(/\s+/g, ' ').trim()).toString());
