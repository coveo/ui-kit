import fs from 'fs-extra';
import handlebars from 'handlebars';
import path from 'path';
import prettier from 'prettier';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  const templatesDir = path.resolve(__dirname, 'generate-component-templates');
  const resolvedOutputDir = path.resolve(outputDir);
  const namePascalCase = kebabToPascal(name);
  const shorterName = name.replace(/^atomic-/, '').toLowerCase();

  const files = [
    {template: 'component.ts.hbs', output: `${name}.ts`},
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

    // Check if the file already exists
    if (await fs.pathExists(outputPath)) {
      console.log(`Skipped (already exists): ${outputPath}`);
      continue; // Skip to the next file
    }

    const templateContent = await fs.readFile(templatePath, 'utf8');
    const compiled = handlebars.compile(templateContent);
    let content = compiled({name, namePascalCase, shorterName});

    content = await formatWithPrettier(content, outputPath);

    await fs.ensureDir(path.dirname(outputPath));
    await fs.writeFile(outputPath, content, 'utf8');
    console.log(`Created: ${outputPath}`);
  }
}

// Run the script
const [componentName, outputDir] = process.argv.slice(2);
if (!componentName || !outputDir) {
  console.error(
    'Usage: node generate-component.js <component-name> <output-dir>'
  );
  process.exit(1);
}

generateFiles(componentName, outputDir).catch(console.error);
