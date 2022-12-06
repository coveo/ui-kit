const {readFileSync, writeFileSync} = require('fs');
const {resolve} = require('path');

const packageJSONPath = resolve('./projects/atomic-angular/dist/package.json');

const packageJSON = JSON.parse(readFileSync(packageJSONPath));
if (!packageJSON.scripts) {
  packageJSON.scripts = {};
}
packageJSON.scripts['npm:publish:prerelease'] =
  'node ../../../../../scripts/deploy/publish.mjs prerelease';
packageJSON.scripts['npm:publish:alpha'] =
  'node ../../../../../scripts/deploy/publish.mjs release';

writeFileSync(packageJSONPath, JSON.stringify(packageJSON, null, 2));
