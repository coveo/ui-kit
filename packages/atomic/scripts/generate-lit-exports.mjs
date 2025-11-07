import {execSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import colors from '../../../utils/ci/colors.mjs';

const directories = [
  'commerce',
  'common',
  'search',
  'insight',
  'ipx',
  'recommendations',
];

const baseComponentsDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../src/components'
);

function isLitComponent(filePath) {
  if (!fs.existsSync(filePath)) {
    return false;
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  return content.includes('LitElement');
}

function toPascalCase(name) {
  return name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

function findLitComponents(dirPath, baseDir) {
  const entries = fs.readdirSync(dirPath, {withFileTypes: true});
  let components = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const fullPath = path.join(dirPath, entry.name);
    const componentFile = path.join(fullPath, `${entry.name}.ts`);

    // Check if this directory has a component file
    if (fs.existsSync(componentFile) && isLitComponent(componentFile)) {
      const relativePath = path.relative(baseDir, fullPath);
      components.push({
        name: entry.name,
        path: relativePath.split(path.sep).join('/'),
      });
    }

    // Recursively search subdirectories (but skip common utility dirs)
    if (!entry.name.startsWith('.') && !entry.name.includes('e2e')) {
      components = components.concat(findLitComponents(fullPath, baseDir));
    }
  }

  return components;
}

async function generateLitExportsForDir(dir) {
  const componentsDir = path.join(baseComponentsDir, dir);
  const outputIndexFile = path.join(componentsDir, 'index.ts');
  const outputLazyIndexFile = path.join(componentsDir, 'lazy-index.ts');

  const litComponents = findLitComponents(componentsDir, componentsDir).sort(
    (a, b) => a.name.localeCompare(b.name)
  );

  const indexFileContent = `
    // Auto-generated file
    ${
      litComponents.length > 0
        ? litComponents
            .map(
              (component) =>
                `export {${toPascalCase(component.name)}} from './${component.path}/${component.name}.js';`
            )
            .join('\n')
        : 'export {};'
    }
  `;
  const lazyIndexFileContent = `
    // Auto-generated file
    export default {
       ${litComponents
         .map(
           (component) =>
             `'${component.name}': async () => await import('./${component.path}/${component.name}.js'),`
         )
         .join('\n  ')}
    } as Record<string, () => Promise<unknown>>;
 
    export type * from './index.js';
  `;

  fs.writeFileSync(outputIndexFile, indexFileContent);
  fs.writeFileSync(outputLazyIndexFile, lazyIndexFileContent);
}

export async function formatAllGeneratedLitExports() {
  const files = directories.flatMap((dir) => {
    const componentsDir = path.join(baseComponentsDir, dir);
    return [
      path.join(componentsDir, 'index.ts'),
      path.join(componentsDir, 'lazy-index.ts'),
    ];
  });

  execSync(`npx @biomejs/biome format --write ${files.join(' ')}`);
}

export async function generateLitExports() {
  for (const dir of directories) {
    console.log(colors.blue('Directory:'), colors.green(dir));
    await generateLitExportsForDir(dir);
  }
  await formatAllGeneratedLitExports();
}
