import {cpSync, existsSync, mkdirSync} from 'node:fs';
import {resolve} from 'node:path';

const atomicPkg = resolve('./node_modules/@coveo/atomic');

function findDir(name) {
  const flat = resolve(atomicPkg, 'dist', name);
  if (existsSync(flat)) return flat;
  const nested = resolve(atomicPkg, 'dist', 'atomic', name);
  if (existsSync(nested)) return nested;
  return null;
}

for (const dir of ['lang', 'assets']) {
  const src = findDir(dir);
  if (!src) {
    console.warn(`Could not find ${dir} directory, skipping`);
    continue;
  }
  const dest = resolve('./public', dir);
  mkdirSync(dest, {recursive: true});
  cpSync(src, dest, {recursive: true});
  console.log(`Copied ${src} → ${dest}`);
}
