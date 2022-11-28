import awsSDK from 'aws-sdk';
import {resolve} from 'path';
import {getPackageFromPath, workspacesRoot} from '../packages.mjs';

const cloudfront = new awsSDK.CloudFront();

async function getMajorVersion(dir) {
  const {version} = getPackageFromPath(
    resolve(workspacesRoot, 'packages', dir, 'package.json')
  );
  return version.split('.')[0];
}

async function main() {
  const pathsToInvalidate = [
    '/atomic/latest/*',
    `/atomic/v${await getMajorVersion('atomic')}/*`,
    '/headless/latest/*',
    `/headless/v${await getMajorVersion('headless')}/*`,
  ];

  const invalidationRequest = cloudfront.createInvalidation({
    DistributionId: 'E2VWLFSCSD1GLA',
    InvalidationBatch: {
      CallerReference: new Date().getTime().toString(),
      Paths: {
        Quantity: pathsToInvalidate.length,
        Items: pathsToInvalidate,
      },
    },
  });

  invalidationRequest.send((error, success) => {
    if (error) {
      console.log('ERROR WHILE INVALIDATING RESSOURCES ON CLOUDFRONT');
      console.log('*************');
      console.log(error.message);
      console.log('*************');
      throw error;
    }
    if (success) {
      console.log('INVALIDATION ON CLOUDFRONT SUCCESSFUL');
      console.log('*************');
      console.log(`PATHS INVALIDATED: ${pathsToInvalidate}`);
      console.log(`INVALIDATION ID : ${success.Invalidation.Id}`);
      console.log('*************');
    }
  });
}

main();
