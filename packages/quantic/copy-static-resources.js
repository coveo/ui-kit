/* eslint-disable node/no-unpublished-require */
const {promisify} = require('util');
const ncp = promisify(require('ncp'));

const copy = async (source, dest) => {
  return await ncp(source, dest);
};

const main = async () => {
  console.info('Begin copy.');

  await copy(
    './node_modules/@coveo/headless/dist',
    './force-app/main/default/staticresources/coveoheadless'
  );

  console.info('Headless copied.');

  await copy(
    './node_modules/tributejs/dist',
    './force-app/main/default/staticresources/tributejs'
  );

  console.info('Tributejs copied.');
  return;
};

main().then(() => {
  console.info('Copy done!');
});
