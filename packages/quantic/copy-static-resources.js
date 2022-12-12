const {promisify} = require('util');
const ncp = promisify(require('ncp'));
const mkdir = promisify(require('fs').mkdir);

const copy = async (source, dest) => {
  try {
    return await ncp(source, dest);
  } catch (e) {
    console.log(`Failed to copy: ${source}\nDoes the resource exist?`);
    process.exit(1);
  }
};

const main = async () => {
  console.info('Begin copy.');

  await mkdir(
    './force-app/main/default/staticresources/coveoheadless/browser/case-assist',
    {recursive: true}
  );
  await mkdir(
    './force-app/main/default/staticresources/coveoheadless/browser/insight',
    {recursive: true}
  );
  await mkdir(
    './force-app/main/default/staticresources/coveoheadless/definitions/',
    {recursive: true}
  );
  await mkdir('./force-app/main/default/staticresources/coveobueno/browser', {
    recursive: true,
  });
  await mkdir(
    './force-app/main/default/staticresources/coveobueno/definitions',
    {
      recursive: true,
    }
  );
  await copy(
    '../../node_modules/@coveo/headless/dist/browser/headless.js',
    './force-app/main/default/staticresources/coveoheadless/browser/headless.js'
  );
  await copy(
    '../../node_modules/@coveo/headless/dist/browser/case-assist/headless.js',
    './force-app/main/default/staticresources/coveoheadless/browser/case-assist/headless.js'
  );
  await copy(
    '../../node_modules/@coveo/headless/dist/browser/insight/headless.js',
    './force-app/main/default/staticresources/coveoheadless/browser/insight/headless.js'
  );
  await copy(
    '../../node_modules/@coveo/headless/dist/definitions',
    './force-app/main/default/staticresources/coveoheadless/definitions'
  );
  await copy(
    '../../node_modules/@coveo/bueno/dist/browser/bueno.js',
    './force-app/main/default/staticresources/coveobueno/browser/bueno.js'
  );
  await copy(
    '../../node_modules/@coveo/bueno/dist/definitions',
    './force-app/main/default/staticresources/coveobueno/definitions'
  );

  console.info('Headless copied.');
};

main().then(() => {
  console.info('Copy done!');
});
