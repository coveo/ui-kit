import fs from 'fs-extra';
import handlebars from 'handlebars';
import path from 'path';
import prettier from 'prettier';

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
const kebabToPascal = (str) => str.split('-').map(capitalize).join('');

async function formatWithPrettier(content, filePath) {
  try {
    const options = await prettier.resolveConfig(filePath);
    return prettier.format(content, {...options, filepath: filePath});
  } catch (error) {
    console.warn(`Failed to format ${filePath} with Prettier`, error);
    return content;
  }
}

async function generateFiles(name, outputDir) {
  const templatesDir = path.resolve(
    import.meta.dirname,
    'generate-component-templates'
  );
  const resolvedOutputDir = path.resolve(outputDir);
  const namePascalCase = kebabToPascal(name);
  const shorterName = namePascalCase
    .replace(/^Atomic/, '')
    .replace(/^./, (c) => c.toLowerCase());

  const files = [
    {template: 'component.ts.hbs', output: `${name}.ts`},
    {template: 'component.mdx.hbs', output: `${name}.mdx`},
    {
      template: 'component.new.stories.tsx.hbs',
      output: `${name}.new.stories.tsx`,
    },
    {template: 'component.css.hbs', output: `${name}.css`},
    {template: 'component.spec.ts.hbs', output: `${name}.spec.ts`},
    {template: 'e2e/component.e2e.ts.hbs', output: `e2e/${name}.e2e.ts`},
    {template: 'e2e/fixture.ts.hbs', output: `e2e/fixture.ts`},
    {template: 'e2e/page-object.ts.hbs', output: `e2e/page-object.ts`},
  ];

  for (const file of files) {
    const templatePath = path.join(templatesDir, file.template);

    const outputPath = path.join(
      resolvedOutputDir,
      file.output.replace('noop', name)
    );

    // Does not overwrite existing files
    if (await fs.pathExists(outputPath)) {
      console.log(`Skipped (already exists): ${outputPath}`);
      continue;
    }

    const templateContent = await fs.readFile(templatePath, 'utf8');
    const compiled = handlebars.compile(templateContent);
    let content = compiled({name, namePascalCase, shorterName});

    // Format each file with Prettier
    content = await formatWithPrettier(content, outputPath);

    await fs.ensureDir(path.dirname(outputPath));
    await fs.writeFile(outputPath, content, 'utf8');
    console.log(`Created: ${outputPath}`);
  }
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
    'Usage: npx nx run atomic:generate-component --name=<component-name> --output=<output-dir>'
  );
  process.exit(1);
}

generateFiles(normalizedComponentName, resolvedOutputDir).catch(console.error);

// add the import to the lazy index file
// add the import to the index file
// change the output arg to always start with search/commerce/insight/ipx/recommendations
