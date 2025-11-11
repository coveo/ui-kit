const fs = require('fs/promises');
const path = require('path');

const STATIC_RESOURCES_PATH = './force-app/main/default/staticresources';
const SOLUTION_EXAMPLES_STATIC_RESOURCES_PATH =
  './force-app/solutionExamples/main/staticresources';
const TEMP_DIR = '.tmp/quantic-compiled';

function resolveLibraryPath(packageName, relativePath) {
  return path.resolve(path.dirname(require.resolve(packageName)), relativePath);
}

const LIBRARY_CONFIG = {
  dompurify: {
    directories: [`${STATIC_RESOURCES_PATH}/dompurify`],
    files: [
      {
        src: resolveLibraryPath('dompurify', '../dist/purify.min.js'),
        dest: `${STATIC_RESOURCES_PATH}/dompurify/purify.min.js`,
      },
    ],
  },
  marked: {
    directories: [`${STATIC_RESOURCES_PATH}/marked`],
    files: [
      {
        src: resolveLibraryPath('marked', '../marked.min.js'),
        dest: `${STATIC_RESOURCES_PATH}/marked/marked.min.js`,
      },
    ],
  },
  coveoua: {
    directories: [`${SOLUTION_EXAMPLES_STATIC_RESOURCES_PATH}/coveoua`],
    files: [
      {
        src: resolveLibraryPath('coveo.analytics', '../dist/coveoua.js'),
        dest: `${SOLUTION_EXAMPLES_STATIC_RESOURCES_PATH}/coveoua/coveoua.js`,
      },
    ],
  },
  bueno: {
    directories: [
      `${STATIC_RESOURCES_PATH}/coveobueno/browser`,
      `${STATIC_RESOURCES_PATH}/coveobueno/definitions`,
    ],
    files: [
      {
        src: resolveLibraryPath('@coveo/bueno', '../cdn/bueno.js'),
        dest: `${STATIC_RESOURCES_PATH}/coveobueno/browser/bueno.js`,
      },
      {
        src: resolveLibraryPath('@coveo/bueno', '../dist/definitions'),
        dest: `${STATIC_RESOURCES_PATH}/coveobueno/definitions`,
      },
    ],
  },
  headless: {
    directories: [
      `${STATIC_RESOURCES_PATH}/coveoheadless/case-assist`,
      `${STATIC_RESOURCES_PATH}/coveoheadless/insight`,
      `${STATIC_RESOURCES_PATH}/coveoheadless/recommendation`,
      `${STATIC_RESOURCES_PATH}/coveoheadless/definitions`,
    ],
    files: [
      {
        src: `${TEMP_DIR}/headless.js`,
        dest: `${STATIC_RESOURCES_PATH}/coveoheadless/headless.js`,
      },
      {
        src: `${TEMP_DIR}/case-assist/headless.js`,
        dest: `${STATIC_RESOURCES_PATH}/coveoheadless/case-assist/headless.js`,
      },
      {
        src: `${TEMP_DIR}/insight/headless.js`,
        dest: `${STATIC_RESOURCES_PATH}/coveoheadless/insight/headless.js`,
      },
      {
        src: `${TEMP_DIR}/recommendation/headless.js`,
        dest: `${STATIC_RESOURCES_PATH}/coveoheadless/recommendation/headless.js`,
      },
      {
        src: resolveLibraryPath('@coveo/headless', '../../dist/definitions'),
        dest: `${STATIC_RESOURCES_PATH}/coveoheadless/definitions`,
      },
    ],
  },
};

async function getPackageVersion() {
  const packageJsonPath = path.join(__dirname, 'package.json');
  const packageData = await fs.readFile(packageJsonPath, 'utf8');
  return JSON.parse(packageData).version;
}

async function copy(src, dest) {
  try {
    await fs.rm(dest, {recursive: true, force: true});
    await fs.mkdir(path.dirname(dest), {recursive: true});
    await fs.cp(src, dest, {recursive: true, force: true});
  } catch (error) {
    console.error(`Failed to copy: ${src}\nError: ${error.message}`);
    process.exit(1);
  }
}

async function createDirectories(directories) {
  try {
    for (const dir of directories) {
      await fs.mkdir(dir, {recursive: true});
    }
  } catch (error) {
    console.error(`Failed to create directories\nError: ${error.message}`);
    process.exit(1);
  }
}

async function writeQuanticVersion(filePath) {
  try {
    const existingContent = await fs.readFile(filePath, 'utf8');
    const version = await getPackageVersion();
    const contentToAppend = `\nwindow.coveoQuanticVersion = '${version}';`;
    const endsWithNewline = existingContent.endsWith('\n');
    const newContent = endsWithNewline
      ? existingContent + contentToAppend
      : existingContent + '\n' + contentToAppend;
    await fs.writeFile(filePath, newContent, 'utf8');
    console.info(`Quantic version written to ${filePath}`);
  } catch (error) {
    console.error(
      `Failed to write Quantic version in: ${filePath}\nError: ${error.message}`
    );
    process.exit(1);
  }
}

async function copyLibrary(config) {
  if (config.directories) {
    await createDirectories(config.directories);
  }
  for (const {src, dest} of config.files) {
    await copy(src, dest);
  }
}

async function fixCoveoUA() {
  // Fix the Coveo UA script, `globalThis` is not supported in Locker Service
  // https://developer.salesforce.com/docs/component-library/tools/locker-service-viewer
  const problemText = 'globalThis';
  const solutionText = 'window';
  const coveoUAFilePath = path.join(
    SOLUTION_EXAMPLES_STATIC_RESOURCES_PATH,
    'coveoua',
    'coveoua.js'
  );

  try {
    const coveoUAContent = await fs.readFile(coveoUAFilePath, 'utf8');
    const fixedCoveoUAContent = coveoUAContent.replace(
      new RegExp(problemText, 'g'),
      solutionText
    );

    // Only write if changes were made
    if (coveoUAContent !== fixedCoveoUAContent) {
      await fs.writeFile(coveoUAFilePath, fixedCoveoUAContent, 'utf8');
      console.info(
        `Fixed Coveo UA: replaced "${problemText}" with "${solutionText}"`
      );
    } else {
      console.info('Coveo UA: no fixes needed');
    }
  } catch (error) {
    console.error(
      `Failed to fix Coveo UA script: ${coveoUAFilePath}\nError: ${error.message}`
    );
    process.exit(1);
  }
}

// IF YOU NEED TO ADD A NEW LIBRARY BE SURE TO ADD IT TO THE TURBO OUTPUTS : packages/quantic/turbo.json
async function main() {
  console.info('Begin building static resources');

  await copyLibrary(LIBRARY_CONFIG.dompurify);
  console.info('DOMPurify copied.');

  await copyLibrary(LIBRARY_CONFIG.marked);
  console.info('Marked copied.');

  await copyLibrary(LIBRARY_CONFIG.bueno);
  console.info('Bueno copied.');

  await copyLibrary(LIBRARY_CONFIG.headless);
  console.info('Headless copied.');

  await copyLibrary(LIBRARY_CONFIG.coveoua);
  await fixCoveoUA();
  console.info('Coveo.analytics copied to solutionsExamples.');

  LIBRARY_CONFIG.headless.files.forEach(async ({dest}) => {
    if (dest.includes('headless.js')) {
      await writeQuanticVersion(dest);
    }
  });
  console.info('Headless augmented with Quantic version.');

  console.info('All resources built successfully!');
}

main().catch((error) => {
  console.error('An error occurred during the build process:', error);
});
