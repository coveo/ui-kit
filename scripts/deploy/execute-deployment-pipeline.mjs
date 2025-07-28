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
  return [
    parsedVersion?.major,
    parsedVersion?.minor,
    parsedVersion?.patch,
    parsedVersion.prerelease[0] || undefined,
  ];
}

function getResolveVariableString(version, packageName) {
  const prNumber = process.env.PR_NUMBER;
  const versionComposantsOrdered = getVersionComposants(version);
  if (process.env.PATCH_ONLY && prNumber) {
    return `--resolve ${packageName}_PATCH_VERSION=${versionComposantsOrdered.concat(prNumber).join('.')}`;
  } else {
    return `
    --resolve ${packageName}_MAJOR_VERSION=${versionComposantsOrdered.slice(0, 1)}
    --resolve ${packageName}_MINOR_VERSION=${versionComposantsOrdered.slice(0, 2).join('.')}
    --resolve ${packageName}_PATCH_VERSION=${versionComposantsOrdered.slice(0, 3).join('.')}
  `;
  }
}

const root = getVersionComposants(rootJson.version);
const IS_NIGHTLY = root.includes(undefined);

console.log(
  execSync(
    `
  deployment-package package create --with-deploy
    --version ${root.join('.')}
    --resolve IS_NIGHTLY=${IS_NIGHTLY}
    --resolve IS_NOT_NIGHTLY=${!IS_NIGHTLY}
    ${getResolveVariableString(buenoJson.version, 'BUENO')}
    ${getResolveVariableString(headlessJson.version, 'HEADLESS')}
    ${getResolveVariableString(atomicJson.version, 'ATOMIC')}
    ${getResolveVariableString(atomicReactJson.version, 'ATOMIC_REACT')}
    ${getResolveVariableString(atomicHostedPageJson.version, 'ATOMIC_HOSTED_PAGE')}
    ${getResolveVariableString(shopifyJson.version, 'SHOPIFY')}
    --resolve GITHUB_RUN_ID=${process.env.RUN_ID}`
      .replaceAll(/\s+/g, ' ')
      .trim()
  ).toString()
);
