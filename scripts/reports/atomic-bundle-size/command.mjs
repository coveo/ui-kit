import {mkdirSync, rmSync, statSync} from 'node:fs';
import {resolve} from 'node:path';
import {execute} from '../../exec.mjs';

// Define the specific Atomic entry points we want to measure
const ATOMIC_ENTRY_POINTS = {
  'atomic-full': 'dist/index.js',
  'atomic-lit-all': 'dist/atomic/components/components/index.js',
  'atomic-lit-commerce': 'dist/atomic/components/components/commerce/index.js',
  'atomic-lit-insight': 'dist/atomic/components/components/insight/index.js',
  'atomic-lit-ipx': 'dist/atomic/components/components/ipx/index.js',
  'atomic-lit-recommendations':
    'dist/atomic/components/components/recommendations/index.js',
  'atomic-lit-search': 'dist/atomic/components/components/search/index.js',
};

async function setup() {
  console.log('setting up repositories');
  await execute('npm', ['ci']);
}

async function buildFiles() {
  console.log('building atomic files');
  await execute('npx', ['turbo', '@coveo/atomic#build']);
}

async function createBundles() {
  console.log('creating bundles for atomic entry points');
  const atomicDir = resolve('packages', 'atomic');
  const bundleDir = resolve(atomicDir, 'temp-bundle-analysis');

  // Clean and create bundle directory
  try {
    rmSync(bundleDir, {recursive: true, force: true});
  } catch {
    // Directory might not exist, that's fine
  }
  mkdirSync(bundleDir, {recursive: true});

  const bundleSizes = {};

  for (const [useCase, relativePath] of Object.entries(ATOMIC_ENTRY_POINTS)) {
    const entryPath = resolve(atomicDir, relativePath);
    const bundlePath = resolve(bundleDir, `${useCase}.bundle.js`);

    try {
      // Check if entry file exists
      statSync(entryPath);

      // Use esbuild to create a bundle
      await execute(
        'npx',
        [
          'esbuild',
          entryPath,
          '--bundle',
          '--minify',
          '--format=esm',
          '--platform=browser',
          '--tree-shaking=true',
          '--external:@coveo/headless',
          '--external:lit',
          '--external:lit-html',
          '--external:@lit/reactive-element',
          `--outfile=${bundlePath}`,
        ],
        {cwd: atomicDir}
      );

      const {size} = statSync(bundlePath);
      bundleSizes[useCase] = size;
      console.log(`✓ ${useCase}: ${(size / 1024).toFixed(1)} KB`);
    } catch (error) {
      console.warn(`⚠ Could not bundle ${useCase}:`, error.message);
      bundleSizes[useCase] = 0;
    }
  }

  // Clean up bundle directory
  try {
    rmSync(bundleDir, {recursive: true, force: true});
  } catch (error) {
    console.warn('Could not clean up bundle directory:', error.message);
  }

  return bundleSizes;
}

function readAtomicFileSizes() {
  console.log('getting atomic file sizes');
  const atomicDir = resolve('packages', 'atomic');
  const sizeEntries = [];

  for (const [useCase, relativePath] of Object.entries(ATOMIC_ENTRY_POINTS)) {
    const filePath = resolve(atomicDir, relativePath);

    try {
      const {size} = statSync(filePath);
      sizeEntries.push([useCase, size]);
      console.log(`✓ ${useCase}: ${(size / 1024).toFixed(1)} KB`);
    } catch (error) {
      console.warn(
        `⚠ Could not read ${useCase} at ${filePath}:`,
        error.message
      );
      // Set size to 0 for missing files to avoid breaking the report
      sizeEntries.push([useCase, 0]);
    }
  }

  return Object.fromEntries(sizeEntries);
}

export async function computeAtomicFileSizes() {
  await setup();
  await buildFiles();

  // Try to create bundles first, fallback to file sizes if bundling fails
  try {
    return await createBundles();
  } catch (error) {
    console.warn('Bundling failed, falling back to file sizes:', error.message);
    return readAtomicFileSizes();
  }
}
