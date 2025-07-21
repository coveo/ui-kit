import {
  cpSync,
  readdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from 'node:fs';
import {dirname, join, relative, resolve, sep} from 'node:path';

const headlessVersion = JSON.parse(
  readFileSync('../headless/package.json', 'utf8')
).version;
const atomicVersion = JSON.parse(
  readFileSync('./package.json', 'utf8')
).version;

const srcDir = resolve('./stencil-proxy');
const distDir = resolve('./dist');

const files = readdirSync(srcDir, {
  recursive: true,
  withFileTypes: true,
}).toSorted((a, b) => {
  const aPath = join(a.parentPath, a.name);
  const bPath = join(b.parentPath, b.name);
  return aPath.localeCompare(bPath);
});

const prefixFileWithUnderscore = (file) =>
  `${file.split(sep).slice(0, -1).join(sep) + sep}_${file.split(sep).pop()}`;

for (const file of files) {
  if (file.isFile()) {
    const filePath = relative(srcDir, join(file.parentPath, file.name));
    const proxyFile = join(srcDir, filePath);
    const proxiedFile = join(distDir, filePath);
    renameSync(proxiedFile, prefixFileWithUnderscore(proxiedFile));
    cpSync(proxyFile, proxiedFile, {recursive: true, overwrite: true});

    if (filePath.includes('loader.js')) {
      console.log('Adding version exports ESM');
      let content = '';
      content += `export const headlessVersion = '${headlessVersion}';\n`;
      content += `export const atomicVersion = '${atomicVersion}';\n`;

      const versionFilePath = join(dirname(proxiedFile), 'version.js');

      writeFileSync(versionFilePath, content, 'utf8');
    }
    if (filePath.includes('loader.cjs.js')) {
      console.log('Adding version exports CJS');
      let content = '';
      content += `module.exports.headlessVersion = '${headlessVersion}';\n`;
      content += `module.exports.atomicVersion = '${atomicVersion}';\n`;

      const versionFilePath = join(dirname(proxiedFile), 'version.cjs.js');

      writeFileSync(versionFilePath, content, 'utf8');
    }
  }
}
