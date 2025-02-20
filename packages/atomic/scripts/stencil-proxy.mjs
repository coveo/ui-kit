import {cpSync, readdirSync, renameSync} from 'node:fs';
import {join, sep, resolve, relative} from 'node:path';

const srcDir = resolve('./stencil-proxy');
const distDir = resolve('./dist');

const files = readdirSync(srcDir, {recursive: true, withFileTypes: true});

const prefixFileWithUnderscore = (file) =>
  file.split(sep).slice(0, -1).join(sep) + sep + '_' + file.split(sep).pop();

for (const file of files) {
  if (file.isFile()) {
    const filePath = relative(srcDir, join(file.parentPath, file.name));
    const proxyFile = join(srcDir, filePath);
    const proxiedFile = join(distDir, filePath);
    renameSync(proxiedFile, prefixFileWithUnderscore(proxiedFile));
    cpSync(proxyFile, proxiedFile, {recursive: true, overwrite: true});
  }
}
