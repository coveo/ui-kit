import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
import {formatWithPrettier} from './format-with-prettier.mjs';

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

function findLitComponentsRecursively(dir, basePath = '') {
  const components = [];
  const files = fs.readdirSync(dir, {withFileTypes: true});

  for (const file of files) {
    if (file.isDirectory()) {
      const fullPath = path.join(dir, file.name);
      const componentPath = path.join(fullPath, `${file.name}.ts`);
      const relativePath = basePath ? `${basePath}/${file.name}` : file.name;

      if (fs.existsSync(componentPath) && isLitComponent(componentPath)) {
        components.push({
          name: file.name,
          path: relativePath,
        });
      } else {
        const nestedComponents = findLitComponentsRecursively(
          fullPath,
          relativePath
        );
        components.push(...nestedComponents);
      }
    }
  }

  return components;
}

async function generateLitExportsForDir(dir) {
  const componentsDir = path.join(baseComponentsDir, dir);
  const outputIndexFile = path.join(componentsDir, 'index.ts');
  const outputLazyIndexFile = path.join(componentsDir, 'lazy-index.ts');

  const litComponents = findLitComponentsRecursively(componentsDir).sort(
    (a, b) => a.name.localeCompare(b.name)
  );

  let indexFileContent = `
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
  let lazyIndexFileContent = `
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

  indexFileContent = await formatWithPrettier(
    indexFileContent,
    outputIndexFile
  );
  lazyIndexFileContent = await formatWithPrettier(
    lazyIndexFileContent,
    outputLazyIndexFile
  );

  fs.writeFileSync(outputIndexFile, indexFileContent);
  fs.writeFileSync(outputLazyIndexFile, lazyIndexFileContent);
}

export async function generateLitExports() {
  const directories = [
    'commerce',
    'common',
    'search',
    'insight',
    'ipx',
    'recommendations',
  ];
  for (const dir of directories) {
    console.log(chalk.blue('Directory:'), chalk.green(dir));
    await generateLitExportsForDir(dir);
  }
}
