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
    ...(parsedVersion?.prerelease[0] ? [parsedVersion.prerelease[0]] : []),
  ];
}

function getResolveVariableString(version, packageName) {
  const prNumber = process.env.PR_NUMBER;
  const versionComposantsOrdered = getVersionComposants(version);

  // Use PR number as build if available and PATCH_ONLY is set
  const {major, minor, patch} =
    process.env.PATCH_ONLY && prNumber
      ? {
          major: '0',
          minor: '0.0',
          patch: versionComposantsOrdered
            .slice(0, 3)
            .concat(prNumber)
            .join('.'),
        }
      : {
          major: versionComposantsOrdered.slice(0, 1),
          minor: versionComposantsOrdered.slice(0, 2).join('.'),
          patch: versionComposantsOrdered.slice(0, 3).join('.'),
        };

  return `
    --resolve ${packageName}_MAJOR_VERSION=${major} \
    --resolve ${packageName}_MINOR_VERSION=${minor} \
    --resolve ${packageName}_PATCH_VERSION=${patch} \
  `.trim();
}

const root = getVersionComposants(rootJson.version);
const IS_NIGHTLY = root.length > 3;

console.log(
  execSync(
    `
  deployment-package package create --with-deploy \
    --version ${root.join('.')} \
    --resolve IS_NIGHTLY=${IS_NIGHTLY} \
    --resolve IS_NOT_NIGHTLY=${!IS_NIGHTLY} \
    ${getResolveVariableString(buenoJson.version, 'BUENO')} \
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
