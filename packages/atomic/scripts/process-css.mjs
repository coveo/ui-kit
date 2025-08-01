import {
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import {basename, dirname, join, relative} from 'node:path';
import chalk from 'chalk';
import * as lightningcss from 'lightningcss';
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
    export default css;
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
    export default allCss.join('');
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

    const imports = Array.from(data.matchAll(importMatcher)).flat();
    pushImports(srcPath, imports, files);
    const cleanedData = data.replace(importWholeLineMatcher, '');
    const result = await processAndMinifyCss(cleanedData, srcPath);

    const fileContent = generateFileContent(imports, result);
    const jsPath = `${distPath}.js`;
    writeFileSync(jsPath, fileContent);
    console.log(
      chalk.bgGreen('Successfully processed CSS file:'),
      chalk.green(basename(srcPath))
    );
  } catch (err) {
    console.error(
      chalk.bgRed('Error processing file:'),
      chalk.green(basename(srcPath)),
      err
    );
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
    console.error(chalk.bgRed(`Error reading directory: ${srcDir}`), err);
    throw err;
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

function getAllJsFiles(dir) {
  let results = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const stat = statSync(p);
    if (stat.isDirectory()) {
      results = results.concat(getAllJsFiles(p));
    } else if (stat.isFile() && p.endsWith('.js')) {
      results.push(p);
    }
  }
  return results;
}

/**
 * Process all inline css`...` tagged template blocks in JS files through PostCSS/Tailwind
 */
async function processInlineCss(distDir, srcDir) {
  console.log(chalk.bold.blue('Post-processing inline CSS'));
  const {plugins, options} = await postcssLoadConfig();
  const files = getAllJsFiles(distDir);

  for (const file of files) {
    try {
      let content = readFileSync(file, 'utf8');
      const matches = [...content.matchAll(/css `([\s\S]*?)`/g)];
      if (matches.length === 0) continue;

      // Derive the original source file path for PostCSS resolution
      const relativeFromDist = relative(distDir, file);
      const originalSrcFile = join(
        srcDir,
        relativeFromDist.replace(/\.js$/, '.ts')
      );

      for (const match of matches) {
        const fullMatch = match[0];
        const rawCss = match[1];
        const result = await postcss(plugins).process(rawCss, {
          ...options,
          from: originalSrcFile,
        });

        const minified = minifyCss(result, originalSrcFile);
        const escaped = escapeBackslashes(minified);

        content = content.split(fullMatch).join(`css\`${escaped}\``);
      }

      writeFileSync(file, content, 'utf8');
      // Color only the file name green, keep directory uncolored
      console.log(
        chalk.bgGreen('Successfully processed inline CSS'),
        chalk.green(basename(file))
      );
    } catch (err) {
      // Color only the file name green in error path
      console.error(
        chalk.bgRed('Error processing inline CSS in file:'),
        chalk.green(basename(file)),
        err
      );
      throw err;
    }
  }
}

export async function processAllCss(srcDir, distDir) {
  console.log(chalk.bold.blue('Starting CSS processing'));

  await processCssFiles(srcDir, distDir);

  await processInlineCss(distDir, srcDir);

  console.log(chalk.bold.blue('CSS processing complete'));
}
