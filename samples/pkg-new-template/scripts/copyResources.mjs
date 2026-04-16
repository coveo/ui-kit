import {cpSync, existsSync, mkdirSync} from 'node:fs';
import {resolve} from 'node:path';

const atomicDist = resolve('./node_modules/@coveo/atomic/dist');

const resources = [
  {src: resolve(atomicDist, 'lang'), dest: resolve('./public/lang')},
  {src: resolve(atomicDist, 'assets'), dest: resolve('./public/assets')},
];

for (const {src, dest} of resources) {
  if (!existsSync(src)) {
    console.warn(`Source not found, skipping: ${src}`);
    continue;
  }
  mkdirSync(dest, {recursive: true});
  cpSync(src, dest, {recursive: true});
  console.log(`Copied ${src} → ${dest}`);
}
