import chalk from 'chalk';
import {mkdirSync, readdirSync, readFileSync, writeFileSync} from 'fs';
import * as lightningcss from 'lightningcss';
import {dirname, join, relative} from 'path';
import postcss from 'postcss';
import postcssLoadConfig from 'postcss-load-config';
import {dedent} from 'ts-dedent';

function escapeBackslashes(css) {
  return css.replace(/\\/g, '\\\\');
}

async function processAndMinifyCss(content, filename) {
  const {plugins, options} = await postcssLoadConfig();
  const result = await postcss(plugins).process(content, {
    ...options,
    from: filename,
  });

  let processedCss = minifyCss(result, filename);

  processedCss = escapeBackslashes(processedCss);

  return processedCss;
}

function minifyCss(result, filename) {
  return lightningcss
    .transform({
      code: Buffer.from(result.css),
      minify: true,
      sourceMap: true,
      filename: filename,
    })
    .code.toString();
}

const cssToJs = (css) => `const css = \`${css}\`;`;

function generateFileContent(imports, result) {
  const cssJs = cssToJs(result);
  if (imports.length === 0) {
    return dedent`
    ${cssJs}
    export default [css];
    `;
  }

  const importStatements = imports
    .map(
      (importPath, index) =>
        `import dep${index} from '${importPath.replace(/\.css$/, '.css.js')}';`
    )
    .join('\n');

  const exportStatement = `
    const allCss = [${imports
      .map((_, index) => `...dep${index}`)
      .concat('css')
      .join(', ')}];
    export default allCss;
    `;

  return dedent`
    ${importStatements}
    ${cssJs}
    ${exportStatement}
    `;
}

const pushImports = (currentFile, importPaths, files) => {
  for (const importPath of importPaths) {
    const resolvedPath = join(dirname(currentFile), importPath);
    if (!files.includes(resolvedPath)) {
      files.push(resolvedPath);
    }
  }
};

const importMatcher = /(?<=^@import\s+').*\.css(?=';$)/gm;
const importWholeLineMatcher = /^@import\s+'.*\.css';$/gm;

async function convertCssToJs(srcPath, distPath, file) {
  try {
    const data = readFileSync(srcPath, 'utf8');
    const files = [file];

    console.log(
      chalk.blue('Processing:'),
      chalk.green(`${srcPath} -> ${distPath}`)
    );

    const imports = Array.from(data.matchAll(importMatcher)).flatMap(
      (match) => match
    );
    pushImports(srcPath, imports, files);
    const cleanedData = data.replace(importWholeLineMatcher, '');
    const result = await processAndMinifyCss(cleanedData, srcPath);

    const fileContent = generateFileContent(imports, result);
    const jsPath = distPath + '.js';
    writeFileSync(jsPath, fileContent);
    console.log(chalk.blue('Successfully processed:'), chalk.green(jsPath));
  } catch (err) {
    console.error(chalk.red(`Error processing file: ${srcPath}`), err);
    throw err;
  }
}

export async function processCssFiles(srcDir, distDir) {
  let entries;
  try {
    entries = readdirSync(srcDir, {withFileTypes: true}).toSorted((a, b) =>
      a.name.localeCompare(b.name)
    );
  } catch (err) {
    console.error(chalk.red(`Error reading directory: ${srcDir}`), err);
    return;
  }
  for (const entry of entries) {
    const srcPath = join(srcDir, entry.name);
    if (entry.isDirectory()) {
      await processCssFiles(srcPath, join(distDir, entry.name));
    } else if (entry.isFile() && entry.name.endsWith('.css')) {
      const relPath = relative(srcDir, srcPath);
      const distPath = join(distDir, relPath);
      const targetDir = dirname(distPath);
      mkdirSync(targetDir, {recursive: true});
      await convertCssToJs(srcPath, distPath, entry);
    }
  }
}
