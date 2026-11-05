import {readFileSync} from 'node:fs';
import {join, posix, sep} from 'node:path';

export const CHUNK_MAP_FILE = 'cdn-chunk-map.json';

const toPosix = (path) => path.split(sep).join('/');

/**
 * Names a module the same way on every machine and in every build: an Atomic source by its path
 * in the package, an npm module by its path from the package name on, so that pnpm's store layout
 * and the package version drop out.
 */
export function moduleKey(resource, atomicDir) {
  const path = toPosix(resource).split('?')[0];
  const packages = path.lastIndexOf('/node_modules/');
  if (packages !== -1) {
    return path.slice(packages + '/node_modules/'.length);
  }
  return posix.relative(toPosix(atomicDir), path);
}

export function readChunkMap(atomicDir) {
  return JSON.parse(readFileSync(join(atomicDir, CHUNK_MAP_FILE), 'utf8'));
}

/** @returns {Map<string, string>} module key -> chunk name */
export function chunkOfModule(chunkMap) {
  const chunks = new Map();
  for (const group of chunkMap.groups) {
    for (const module of group.modules) {
      chunks.set(module, group.chunk);
    }
  }
  return chunks;
}
