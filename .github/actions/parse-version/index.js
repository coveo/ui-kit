const {setOutput} = require('@actions/core');
const headlessPackage = require('../../../packages/headless/package.json');
const atomicPackage = require('../../../packages/atomic/package.json');

/**
 * @param {string} fullVersion
 */
function getVersions(fullVersion) {
  const [minor, major] = /^([^\.]*)\.[^\.]*/.exec(fullVersion);
  return {minor, major};
}

const headlessVersions = getVersions(headlessPackage.version);
const atomicVersions = getVersions(atomicPackage.version);

setOutput('headless-major', headlessVersions.major);
setOutput('headless-minor', headlessVersions.minor);
setOutput('atomic-major', atomicVersions.major);
setOutput('atomic-minor', atomicVersions.minor);
