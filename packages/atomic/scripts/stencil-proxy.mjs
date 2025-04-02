import {
  cpSync,
  readdirSync,
  renameSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import {join, sep, resolve, relative} from 'node:path';

const headlessVersion = JSON.parse(
  readFileSync('../headless/package.json', 'utf8')
).version;
const atomicVersion = JSON.parse(
  readFileSync('./package.json', 'utf8')
).version;

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

    if (filePath.includes('atomic.esm.js')) {
      console.log('Adding version exports to atomic.esm.js');
      let content = readFileSync(proxiedFile, 'utf8');

      // Append version exports at the end of the file so that they can be dynamically imported from the CDN.
      content += `\nexport const headlessVersion = '${headlessVersion}';\n`;
      content += `export const atomicVersion = '${atomicVersion}';\n`;

      writeFileSync(proxiedFile, content, 'utf8');
    }
  }
}
