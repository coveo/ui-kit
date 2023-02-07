import {readFileSync, writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {cwd} from 'node:process';
import {
  getWorkspacesFromPackagePath,
  packageDirsSnyk,
  workspacesRoot,
} from '../packages.mjs';
import YAML from 'yaml';

const manifestPath = resolve(workspacesRoot, 'pnpm-workspace.yaml');
const manifest = getWorkspacesFromPackagePath(workspacesRoot);
manifest.packages = manifest.packages.filter((wp) =>
  packageDirsSnyk.map((dir) => `packages/${dir}`).includes(wp)
);
writeFileSync(manifestPath, YAML.stringify(manifest));
