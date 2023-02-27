const {readFileSync, writeFileSync} = require('fs');
const {resolve} = require('path');

const packageJSONPath = resolve('./projects/atomic-angular/dist/package.json');

const packageJSON = JSON.parse(readFileSync(packageJSONPath));
if (!packageJSON.scripts) {
  packageJSON.scripts = {};
}
packageJSON.scripts['publish:npm:release'] =
  'node ../../../../../scripts/deploy/publish.mjs release';
packageJSON.scripts['publish:npm:prerelease'] =
  'node ../../../../../scripts/deploy/publish.mjs prerelease';

writeFileSync(packageJSONPath, JSON.stringify(packageJSON, null, 2));
