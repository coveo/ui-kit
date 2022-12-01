import {readFileSync, writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {cwd} from 'node:process';
import {packageDirsSnyk} from '../packages.mjs';

const packageJsonPath = resolve(cwd(), 'package.json');

const packageJSON = JSON.parse(readFileSync(packageJsonPath));
packageJSON.workspaces = packageJSON.workspaces.filter((wp) =>
  packageDirsSnyk.map((dir) => `packages/${dir}`).includes(wp)
);
writeFileSync(
  packageJsonPath,
  JSON.stringify(packageJSON, undefined, 2) + '\n'
);
