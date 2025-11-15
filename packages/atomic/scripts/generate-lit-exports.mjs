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

function findLitComponentsRecursively(dirPath, basePath = dirPath) {
  const entries = fs.readdirSync(dirPath, {withFileTypes: true});
  const litComponents = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const fullPath = path.join(dirPath, entry.name);
      const componentPath = path.join(fullPath, `${entry.name}.ts`);

      if (fs.existsSync(componentPath) && isLitComponent(componentPath)) {
        // Found a Lit component
        const relativePath = path.relative(basePath, fullPath);
        litComponents.push({
          name: entry.name,
          relativePath: relativePath.split(path.sep).join('/'),
        });
      } else {
        // Recursively search subdirectories
        litComponents.push(...findLitComponentsRecursively(fullPath, basePath));
      }
    }
  }

  return litComponents;
}

async function generateLitExportsForDir(dir) {
  const componentsDir = path.join(baseComponentsDir, dir);
  const outputIndexFile = path.join(componentsDir, 'index.ts');
  const outputLazyIndexFile = path.join(componentsDir, 'lazy-index.ts');

  const litComponents = findLitComponentsRecursively(componentsDir).sort(
    (a, b) => a.name.localeCompare(b.name)
  );

  const indexFileContent = `
    // Auto-generated file
    ${
      litComponents.length > 0
        ? litComponents
            .map(
              (component) =>
                `export {${toPascalCase(component.name)}} from './${component.relativePath}/${component.name}.js';`
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
             `'${component.name}': async () => await import('./${component.relativePath}/${component.name}.js'),`
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
