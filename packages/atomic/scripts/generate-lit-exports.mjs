import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
import {formatWithBiome} from './format-with-biome.mjs';

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

  let indexFileContent = `
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
  let lazyIndexFileContent = `
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

  indexFileContent = await formatWithBiome(indexFileContent, outputIndexFile);
  lazyIndexFileContent = await formatWithBiome(
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
