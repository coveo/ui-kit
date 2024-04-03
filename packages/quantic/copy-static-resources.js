const {promisify} = require('util');
const ncp = promisify(require('ncp'));
const mkdir = promisify(require('fs').mkdir);
const readFile = promisify(require('fs').readFile);
const writeFile = promisify(require('fs').writeFile);

const copy = async (source, dest) => {
  try {
    return await ncp(source, dest);
  } catch (e) {
    console.log(`Failed to copy: ${source}\nDoes the resource exist?`);
    process.exit(1);
  }
};

const applyModificationToAbortControllerPolyfill = async () => {
  const originalContent = await readFile(
    './force-app/main/default/staticresources/abortcontrollerpolyfill/abortcontroller-polyfill-only.js',
    'utf-8'
  );

  const updatedContent = originalContent.replace(
    /self.AbortController = AbortController;/g,
    'self.AbortControllerPolyfillIsUsed = true;\n    self.AbortController = AbortController;'
  );

  await writeFile(
    './force-app/main/default/staticresources/abortcontrollerpolyfill/abortcontroller-polyfill-only.js',
    updatedContent,
    'utf-8'
  );
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
    './force-app/main/default/staticresources/coveoheadless/browser/recommendation',
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
  await mkdir(
    './force-app/main/default/staticresources/abortcontrollerpolyfill',
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
    '../../node_modules/@coveo/headless/dist/browser/recommendation/headless.js',
    './force-app/main/default/staticresources/coveoheadless/browser/recommendation/headless.js'
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
  await copy(
    '../../node_modules/abortcontroller-polyfill/dist/abortcontroller-polyfill-only.js',
    './force-app/main/default/staticresources/abortcontrollerpolyfill/abortcontroller-polyfill-only.js'
  );

  await applyModificationToAbortControllerPolyfill();

  console.info('Static resources copied.');
};

main().then(() => {
  console.info('Copy done!');
});
