import {execSync} from 'node:child_process';
import {parse} from 'semver';
import rootJson from '../../package.json' with {type: 'json'};
import atomicJson from '../../packages/atomic/package.json' with {type: 'json'};
import atomicHostedPageJson from '../../packages/atomic-hosted-page/package.json' with {
  type: 'json',
};
import atomicReactJson from '../../packages/atomic-react/package.json' with {
  type: 'json',
};
import buenoJson from '../../packages/bueno/package.json' with {type: 'json'};
import headlessJson from '../../packages/headless/package.json' with {
  type: 'json',
};
import shopifyJson from '../../packages/shopify/package.json' with {
  type: 'json',
};

function getVersionComposants(version) {
  const parsedVersion = parse(version);
  return {
    major: parsedVersion?.major,
    minor: parsedVersion?.minor,
    patch: parsedVersion?.patch,
    build: parsedVersion.prerelease[0],
  };
}

function getResolveVariableString(version, packageName, build) {
  const resolvedVersion = getVersionComposants(version);
  return `
    --resolve ${packageName}_MAJOR_VERSION=${process.env.PATCH_ONLY ? 0 : resolvedVersion.major} \
    --resolve ${packageName}_MINOR_VERSION=${process.env.PATCH_ONLY ? 0 : resolvedVersion.major}.${process.env.PATCH_ONLY ? 0 : resolvedVersion.minor} \
    --resolve ${packageName}_PATCH_VERSION=${[resolvedVersion.major, resolvedVersion.minor, resolvedVersion.patch, ...(build && process.env.PATCH_ONLY  ? [build] : [])].join('.')} \
  `.trim();
}

const root = getVersionComposants(rootJson.version);
const IS_NIGHTLY = !!root.build;

console.log(
  execSync(
    `
  deployment-package package create --with-deploy \
    --version ${root.major}.${root.minor}.${root.patch}${root.build ? `.${root.build}` : ''} \
    --resolve IS_NIGHTLY=${IS_NIGHTLY} \
    --resolve IS_NOT_NIGHTLY=${!IS_NIGHTLY} \
    ${getResolveVariableString(buenoJson.version, 'BUENO', root.build)} \
    ${getResolveVariableString(headlessJson.version, 'HEADLESS', root.build)}
    ${getResolveVariableString(atomicJson.version, 'ATOMIC', root.build)}
    ${getResolveVariableString(atomicReactJson.version, 'ATOMIC_REACT', root.build)}
    ${getResolveVariableString(atomicHostedPageJson.version, 'ATOMIC_HOSTED_PAGE', root.build)}
    ${getResolveVariableString(shopifyJson.version, 'SHOPIFY', root.build)}
    --resolve GITHUB_RUN_ID=${process.env.RUN_ID}`
      .replaceAll(/\s+/g, ' ')
      .trim()
  ).toString()
);
