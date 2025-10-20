import {execSync} from 'node:child_process';
import path from 'node:path';
import fs from 'fs-extra';
import handlebars from 'handlebars';

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
const kebabToPascal = (str) => str.split('-').map(capitalize).join('');

async function generateFiles(name, outputDir) {
  const templatesDir = path.resolve(
    import.meta.dirname,
    'generate-component-templates'
  );
  const resolvedOutputDir = path.resolve(outputDir);
  const githubPath = `${outputDir.split('components/')[1]}/${name}.ts`;
  const namePascalCase = kebabToPascal(name);
  const shorterName = namePascalCase
    .replace(/^Atomic/, '')
    .replace(/^./, (c) => c.toLowerCase());
  const storiesTitleName = name
    .replace('atomic-', '')
    .split('-')
    .map(capitalize)
    .join(' ');

  const files = [
    {template: 'component.ts.hbs', output: `${name}.ts`},
    {template: 'component.mdx.hbs', output: `${name}.mdx`},
    {
      template: 'component.new.stories.tsx.hbs',
      output: `${name}.new.stories.tsx`,
    },
    {template: 'component.spec.ts.hbs', output: `${name}.spec.ts`},
    {template: 'e2e/component.e2e.ts.hbs', output: `e2e/${name}.e2e.ts`},
    {template: 'e2e/fixture.ts.hbs', output: `e2e/fixture.ts`},
    {template: 'e2e/page-object.ts.hbs', output: `e2e/page-object.ts`},
  ];

  const outputPaths = [];

  for (const file of files) {
    const templatePath = path.join(templatesDir, file.template);

    const outputPath = path.join(
      resolvedOutputDir,
      file.output.replace('noop', name)
    );
    outputPaths.push(outputPath);

    // Does not overwrite existing files
    if (await fs.pathExists(outputPath)) {
      console.log(`Skipped (already exists): ${outputPath}`);
      continue;
    }

    const templateContent = await fs.readFile(templatePath, 'utf8');
    const compiled = handlebars.compile(templateContent);
    const content = compiled({
      name,
      namePascalCase,
      shorterName,
      storiesTitleName,
      githubPath,
    });

    await fs.ensureDir(path.dirname(outputPath));
    await fs.writeFile(outputPath, content, 'utf8');
    console.log(`Created: ${outputPath}`);
  }
  execSync(`npx @biomejs/biome check --write ${outputPaths.join(' ')}`);
}

const [componentName, outputDir] = process.argv.slice(2);

// Ensure the component name is prefixed with 'atomic-' if it's not already there
const normalizedComponentName = componentName.startsWith('atomic-')
  ? componentName
  : `atomic-${componentName}`;

let resolvedOutputDir;

if (outputDir) {
  // Use the provided output dir and add the component name
  resolvedOutputDir = path.join(outputDir, normalizedComponentName);
} else {
  // Default to src/components/commerce/<component-name> if no output dir is provided
  resolvedOutputDir = path.resolve(
    'src',
    'components',
    'commerce',
    normalizedComponentName
  );
}

if (!componentName) {
  console.error(
    'Usage: pnpm --filter @coveo/atomic generate-component -- --name=<component-name> --output=<output-dir>'
  );
  process.exit(1);
}

generateFiles(normalizedComponentName, resolvedOutputDir).catch(console.error);
