import {existsSync, readdirSync, readFileSync} from 'node:fs';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repositoryDir = resolve(packageDir, '../..');
const sourceDir = join(packageDir, 'src');
const sampleLinkPattern = /https:\/\/github\.com\/coveo\/ui-kit\/blob\/main\/(samples\/[^)\s]+)/g;

function findTypeScriptFiles(directory) {
  return readdirSync(directory, {withFileTypes: true}).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      return findTypeScriptFiles(path);
    }
    return entry.name.endsWith('.ts') ? [path] : [];
  });
}

const missingLinks = findTypeScriptFiles(sourceDir).flatMap((file) => {
  const source = readFileSync(file, 'utf8');
  return [...source.matchAll(sampleLinkPattern)].flatMap(([, samplePath]) => {
    return existsSync(join(repositoryDir, samplePath)) ? [] : [`${file}: ${samplePath}`];
  });
});

if (missingLinks.length > 0) {
  console.error('TypeDoc links to missing sample files:');
  console.error(missingLinks.join('\n'));
  process.exitCode = 1;
}
