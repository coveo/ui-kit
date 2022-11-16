import {resolve} from 'path';
import {readFileSync, writeFileSync} from 'fs';
import {cwd} from 'process';
import {packageDirsSnyk} from '../packages';
const packageJsonPath = resolve(cwd(), 'package.json');

const packageJSON = JSON.parse(readFileSync(packageJsonPath));
packageJSON.workspaces = packageJSON.workspaces.filter((wp) =>
  packageDirsSnyk.map((dir) => `packages/${dir}`).includes(wp)
);
writeFileSync(
  packageJsonPath,
  JSON.stringify(packageJSON, undefined, 2) + '\n'
);
