/* eslint-disable node/no-unpublished-require */
const {promisify} = require('util');
const ncp = promisify(require('ncp'));

const copy = async (source, dest) => {
  return await ncp(source, dest);
};

const main = async () => {
  console.info('Begin copy.');

  try {
    await copy(
      './node_modules/@coveo/headless/dist',
      './force-app/main/default/staticresources/coveoheadless'
    );
  } catch (error) {
    console.info(error);
  }

  console.info('Headless copied.');
};

main().then(() => {
  console.info('Copy done!');
});
