const {setOutput} = require('@actions/core');
const {major, minor} = require('semver');
const headlessPackage = require('../../../packages/headless/package.json');
const atomicPackage = require('../../../packages/atomic/package.json');

/**
 * @param {string} fullVersion
 */
function getVersions(fullVersion) {
  return {
    major: major(fullVersion),
    minor: minor(fullVersion),
  };
}

const headlessVersions = getVersions(headlessPackage.version);
const atomicVersions = getVersions(atomicPackage.version);

setOutput('headless-major', headlessVersions.major);
setOutput(
  'headless-minor',
  `${headlessVersions.major}.${headlessVersions.minor}`
);
setOutput('atomic-major', atomicVersions.major);
setOutput('atomic-minor', `${atomicVersions.major}.${atomicVersions.minor}`);
