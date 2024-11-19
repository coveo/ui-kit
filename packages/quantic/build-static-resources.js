const {promisify} = require('util');
const ncp = promisify(require('ncp'));
const fs = require('fs').promises;
const path = require('path');

const staticResourcesPath = './force-app/main/default/staticresources';

async function getPackageVersion() {
  const packageJsonPath = path.join(__dirname, 'package.json');
  return JSON.parse(await fs.readFile(packageJsonPath, 'utf8')).version;
}

const copy = async (source, dest) => {
  try {
    return await ncp(source, dest);
  } catch (e) {
    console.log(`Failed to copy: ${source}\nDoes the resource exist?`);
    process.exit(1);
  }
};

const main = async () => {
  console.info('Begin building static resources');
  await copyHeadless();
  await copyBueno();
  await copyMarked();
  await copyDompurify();
  await setupQuanticMetadata();
};

const copyDompurify = async () => {
  console.info('Begin copy DOMPurify.');

  await fs.mkdir(`${staticResourcesPath}/dompurify`, {
    recursive: true,
  });

  await copy(
    '../../node_modules/dompurify/dist/purify.min.js',
    `${staticResourcesPath}/dompurify/purify.min.js`
  );

  console.info('DOMPurify copied.');
};

const copyMarked = async () => {
  console.info('Begin copy Marked.');

  await fs.mkdir(`${staticResourcesPath}/marked`, {
    recursive: true,
  });

  await copy(
    '../../node_modules/marked/marked.min.js',
    `${staticResourcesPath}/marked/marked.min.js`
  );

  console.info('Marked copied.');
};

const copyHeadless = async () => {
  console.info('Begin copy Headless.');

  await fs.mkdir(`${staticResourcesPath}/coveoheadless/case-assist`, {
    recursive: true,
  });
  await fs.mkdir(`${staticResourcesPath}/coveoheadless/insight`, {
    recursive: true,
  });
  await fs.mkdir(`${staticResourcesPath}/coveoheadless/recommendation`, {
    recursive: true,
  });
  await fs.mkdir(`${staticResourcesPath}/coveoheadless/definitions/`, {
    recursive: true,
  });
  await copy(
    '.tmp/quantic-compiled/headless.js',
    `${staticResourcesPath}/coveoheadless/headless.js`
  );
  await copy(
    '.tmp/quantic-compiled/case-assist/headless.js',
    `${staticResourcesPath}/coveoheadless/case-assist/headless.js`
  );
  await copy(
    '.tmp/quantic-compiled/insight/headless.js',
    `${staticResourcesPath}/coveoheadless/insight/headless.js`
  );
  await copy(
    '.tmp/quantic-compiled/recommendation/headless.js',
    `${staticResourcesPath}/coveoheadless/recommendation/headless.js`
  );
  await copy(
    '../../node_modules/@coveo/headless/dist/definitions',
    `${staticResourcesPath}/coveoheadless/definitions`
  );

  await fs.rm('.tmp', {recursive: true});

  console.info('Headless copied.');
};

const copyBueno = async () => {
  console.info('Begin copy Bueno.');

  await fs.mkdir(`${staticResourcesPath}/coveobueno/browser`, {
    recursive: true,
  });
  await fs.mkdir(`${staticResourcesPath}/coveobueno/definitions`, {
    recursive: true,
  });
  await copy(
    '../../node_modules/@coveo/bueno/dist/browser/bueno.js',
    `${staticResourcesPath}/coveobueno/browser/bueno.js`
  );
  await copy(
    '../../node_modules/@coveo/bueno/dist/definitions',
    `${staticResourcesPath}/coveobueno/definitions`
  );

  console.info('Bueno copied.');
};

const setupQuanticMetadata = async () => {
  try {
    console.info('Begin Quantic metadata creation');
    const outputJsonPath = `${staticResourcesPath}/quanticMetadata/quanticMetadata.json`;

    await fs.mkdir(`${staticResourcesPath}/quanticMetadata`, {
      recursive: true,
    });
    const version = await getPackageVersion();
    const metadata = {
      version: version,
    };
    fs.writeFile(outputJsonPath, JSON.stringify(metadata, null, 2), 'utf8');
    console.info('Quantic metadata created.');
  } catch (error) {
    console.error('Error occurred Quantic metadata creation: ', error);
  }
};

main().then(() => {
  console.info('Copy done!');
});
