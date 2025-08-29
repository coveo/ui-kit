import {execSync} from 'node:child_process';
import {writeFileSync} from 'node:fs';
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

const packagesAndVersions = [
  {packageName: 'BUENO', version: buenoJson.version, s3Dir: 'bueno'},
  {packageName: 'HEADLESS', version: headlessJson.version, s3Dir: 'headless'},
  {packageName: 'ATOMIC', version: atomicJson.version, s3Dir: 'atomic'},
  {
    packageName: 'ATOMIC_REACT',
    version: atomicReactJson.version,
    s3Dir: 'atomic-react',
  },
  {
    packageName: 'ATOMIC_HOSTED_PAGE',
    version: atomicHostedPageJson.version,
    s3Dir: 'atomic-hosted-page',
  },
  {packageName: 'SHOPIFY', version: shopifyJson.version, s3Dir: 'shopify'},
];

function getVersionComponents(version) {
  const parsedVersion = parse(version);
  return [
    parsedVersion?.major,
    parsedVersion?.minor,
    parsedVersion?.patch,
    ...(parsedVersion?.prerelease.length > 0 ? parsedVersion.prerelease : []),
  ];
}

function getFullyQualifiedVersion(versionComponentsOrdered) {
  const main = versionComponentsOrdered.slice(0, 3).join('.');
  if (versionComponentsOrdered.length > 3) {
    const suffix = versionComponentsOrdered.slice(3).join('.');
    return `${main}-${suffix}`;
  }

  return main;
}

function getVersionSubpaths(version) {
  const prNumber = process.env.PR_NUMBER;
  const versionComponentsOrdered = getVersionComponents(version);

  // Use PR number as build if available
  return prNumber
    ? {
        patch: versionComponentsOrdered.slice(0, 3).concat(prNumber).join('.'),
      }
    : {
        major: versionComponentsOrdered.slice(0, 1),
        minor: versionComponentsOrdered.slice(0, 2).join('.'),
        patch: getFullyQualifiedVersion(versionComponentsOrdered),
      };
}

function getResolveVariableString(version, packageName) {
  const {major, minor, patch} = {
    major: '0',
    minor: '0.0',
    ...getVersionSubpaths(version),
  };
  if (!patch) {
    throw new Error(`Invalid version for ${packageName}: ${version}`);
  }
  return `
    --resolve ${packageName}_MAJOR_VERSION=${major} \
    --resolve ${packageName}_MINOR_VERSION=${minor} \
    --resolve ${packageName}_PATCH_VERSION=${patch} \
  `.trim();
}

function generateCloudFrontInvalidationPaths() {
  const invalidationVariablePath =
    './infrastructure/terraform/ui-kit/default.tfvars';
  const s3basePath = '/proda/StaticCDN';
  const pathsToInvalidate = [];
  for (const {s3Dir, version} of packagesAndVersions) {
    const versions = Object.values(getVersionSubpaths(version));
    for (const version of versions) {
      pathsToInvalidate.push(`'${s3basePath}/${s3Dir}/v${version}/*'`);
    }
  }
  const invalidationFileContent = `cloudfront_invalidation_paths = "${pathsToInvalidate.join(' ')}"`;
  console.log(
    `Generating CloudFront invalidation file located at ${invalidationVariablePath} with content: ${invalidationFileContent}`
  );
  writeFileSync(invalidationVariablePath, invalidationFileContent, {
    encoding: 'utf8',
  });
}

function generateResolveFlags() {
  return packagesAndVersions
    .map(({packageName, version}) =>
      getResolveVariableString(version, packageName)
    )
    .join(' ');
}

const root = getVersionComponents(rootJson.version);
const IS_NIGHTLY = root.length > 3;

generateCloudFrontInvalidationPaths();
console.log(
  execSync(
    `
  deployment-package package create --with-deploy \
    --version ${root.join('.')} \
    --resolve IS_NIGHTLY=${IS_NIGHTLY} \
    --resolve IS_NOT_NIGHTLY=${!IS_NIGHTLY} \
    ${generateResolveFlags()} \
    --resolve GITHUB_RUN_ID=${process.env.RUN_ID}`
      .replaceAll(/\s+/g, ' ')
      .trim()
  ).toString()
);
