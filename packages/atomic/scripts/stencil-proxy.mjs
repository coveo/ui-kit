import {cpSync, readdirSync, renameSync} from 'node:fs';
import {join} from 'node:path';

const srcDir = './stencil-proxy';
const distDir = './dist';

const files = readdirSync(srcDir, {recursive: true, withFileTypes: true});

const prefixFileWithUnderscore = (file) =>
  file.split('/').slice(0, -1).join('/') + '/_' + file.split('/').pop();

for (const file of files) {
  if (file.isFile()) {
    const filePath = join(file.parentPath, file.name)
      .split('/')
      .slice(1)
      .join('/');
    console.log(filePath);
    const proxyFile = join(srcDir, filePath);
    const proxiedFile = join(distDir, filePath);
    renameSync(proxiedFile, prefixFileWithUnderscore(proxiedFile));
    cpSync(proxyFile, proxiedFile);
  }
}
