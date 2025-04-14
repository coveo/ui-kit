import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

const baseComponentsDir = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
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

function generateLitExportsForDir(dir) {
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

  if (litComponents.length === 0) {
    fs.writeFileSync(outputIndexFile, `// Auto-generated file\nexport {};\n`);
    fs.writeFileSync(
      outputLazyIndexFile,
      `// Auto-generated file\nexport default {} as Record<string, () => Promise<unknown>>;\n\nexport type * from './index.js';\n`
    );
    return;
  }

  const indexExports = litComponents
    .map(
      (component) =>
        `export {${toPascalCase(component)}} from './${component}/${component}.js';`
    )
    .join('\n');

  const lazyIndexExports = litComponents
    .map(
      (component) =>
        `'${component}': async () => await import('./${component}/${component}.js'),`
    )
    .join('\n  ');

  fs.writeFileSync(
    outputIndexFile,
    `// Auto-generated file\n${indexExports}\n`
  );

  fs.writeFileSync(
    outputLazyIndexFile,
    `// Auto-generated file\nexport default {\n  ${lazyIndexExports}\n} as Record<string, () => Promise<unknown>>;\n\nexport type * from './index.js';\n`
  );
}

export function generateLitExports() {
  const directories = [
    'commerce',
    'common',
    'search',
    'insight',
    'ipx',
    'recommendations',
  ];
  directories.forEach((dir) => {
    console.log(chalk.blue('Directory:'), chalk.green(dir));
    generateLitExportsForDir(dir);
  });
}
