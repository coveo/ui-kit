import {exec} from 'child_process';
import {readFileSync} from 'fs';
import {join, dirname} from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const headlessPackageJsonPath = join(
  __dirname,
  '../packages/headless/package.json'
);
const atomicPackageJsonPath = join(
  __dirname,
  '../packages/atomic/package.json'
);

let headlessVersion;
let atomicVersion;

try {
  const headlessPackageJson = JSON.parse(
    readFileSync(headlessPackageJsonPath, 'utf8')
  );
  headlessVersion = 'v' + headlessPackageJson.version;
  console.log('Using headless version from package.json:', headlessVersion);
} catch (error) {
  console.error('Error reading headless package.json:', error);
  process.exit(1);
}

try {
  const atomicPackageJson = JSON.parse(
    readFileSync(atomicPackageJsonPath, 'utf8')
  );
  atomicVersion = 'v' + atomicPackageJson.version;
  console.log('Using atomic version from package.json:', atomicVersion);
} catch (error) {
  console.error('Error reading atomic package.json:', error);
  process.exit(1);
}

const replacements = [
  {
    search: '@coveo/headless/commerce',
    replace: `https://static.cloud.coveo.com/headless/${headlessVersion}/commerce/headless.esm.js`,
  },
  {
    search: '@coveo/headless/insight',
    replace: `https://static.cloud.coveo.com/headless/${headlessVersion}/insight/headless.esm.js`,
  },
  {
    search: '@coveo/headless/product-recommendations',
    replace: `https://static.cloud.coveo.com/headless/${headlessVersion}/product-recommendations/headless.esm.js`,
  },
  {
    search: '@coveo/headless/recommendation',
    replace: `https://static.cloud.coveo.com/headless/${headlessVersion}/recommendation/headless.esm.js`,
  },
  {
    search: '@coveo/headless/case-assist',
    replace: `https://static.cloud.coveo.com/headless/${headlessVersion}/case-assist/headless.esm.js`,
  },
  {
    search: '@coveo/atomic',
    replace: `https://static.cloud.coveo.com/atomic/${atomicVersion}/atomic.esm.js`,
  },
  {
    search: '@coveo/headless',
    replace: `https://static.cloud.coveo.com/headless/${headlessVersion}/headless.esm.js`,
  },
  {
    search: '/build/headless/headless.esm.js',
    replace: `https://static.cloud.coveo.com/headless/${headlessVersion}/headless.esm.js`,
  },
  {
    search: '/build/headless/commerce/headless.esm.js',
    replace: `https://static.cloud.coveo.com/headless/${headlessVersion}/commerce/headless.esm.js`,
  },
  {
    search: '/build/headless/insight/headless.esm.js',
    replace: `https://static.cloud.coveo.com/headless/${headlessVersion}/insight/headless.esm.js`,
  },
  {
    search: '/build/headless/product-recommendations/headless.esm.js',
    replace: `https://static.cloud.coveo.com/headless/${headlessVersion}/product-recommendations/headless.esm.js`,
  },
  {
    search: '/build/headless/recommendation/headless.esm.js',
    replace: `https://static.cloud.coveo.com/headless/${headlessVersion}/recommendation/headless.esm.js`,
  },
  {
    search: '/build/headless/case-assist/headless.esm.js',
    replace: `https://static.cloud.coveo.com/headless/${headlessVersion}/case-assist/headless.esm.js`,
  },
];

const sedCommands = replacements
  .map(({search, replace}) => `-e 's|${search}|${replace}|g'`)
  .join(' ');

const command = `
  find ./packages/atomic/www ./packages/atomic/dist ./packages/atomic-react/dist -type f -exec sed -i '' ${sedCommands} {} +
`;

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Stderr: ${stderr}`);
    return;
  }
  console.log(`Stdout: ${stdout}`);
});
