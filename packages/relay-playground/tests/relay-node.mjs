import {createRelay} from '@coveo/relay';
import {readFileSync} from 'fs';

assertVersion(createRelay({url: 'a', token: 'c', trackingId: 'd'}));

function assertVersion(relay) {
  const {version: relayVersionInPackageJSON} = JSON.parse(
    readFileSync('node_modules/@coveo/relay/package.json', {
      encoding: 'utf-8',
    })
  );

  if (relay.version !== relayVersionInPackageJSON) {
    console.error(
      `the version set in the relay object, ${relay.version}, differs from the package version: ${relayVersionInPackageJSON}`
    );
    process.exit(1);
  }
}
