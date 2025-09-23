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

async function generateLitExportsForDir(dir) {
  const componentsDir = path.join(baseComponentsDir, dir);
  const outputIndexFile = path.join(componentsDir, 'index.ts');
  const outputLazyIndexFile = path.join(componentsDir, 'lazy-index.ts');

  const files = fs.readdirSync(componentsDir, {withFileTypes: true});
  const litComponents = files
    .filter((file) => {
      const componentPath = path.join(
        componentsDir,
        file.name,
        `${file.name}.ts`
      );
      return (
        file.isDirectory() &&
        fs.existsSync(componentPath) &&
        isLitComponent(componentPath)
      );
    })
    .map((file) => file.name)
    .sort();

  const indexFileContent = `
    // Auto-generated file
    ${
      litComponents.length > 0
        ? litComponents
            .map(
              (component) =>
                `export {${toPascalCase(component)}} from './${component}/${component}.js';`
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
             `'${component}': async () => await import('./${component}/${component}.js'),`
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
