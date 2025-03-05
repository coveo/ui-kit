import {
  cpSync,
  readdirSync,
  renameSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import {join} from 'node:path';

const headlessVersion = JSON.parse(
  readFileSync('../headless/package.json', 'utf8')
).version;
const atomicVersion = JSON.parse(
  readFileSync('./package.json', 'utf8')
).version;

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
