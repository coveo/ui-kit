import {
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import {basename, dirname, join, relative} from 'node:path';
import cssnano from 'cssnano';
import postcss from 'postcss';
import postcssLoadConfig from 'postcss-load-config';
import {dedent} from 'ts-dedent';
import colors from '../../../utils/ci/colors.mjs';

function escapeBackslashes(css) {
  return css.replace(/\\/g, '\\\\');
}

async function processAndMinifyCss(content, filename) {
  const {plugins, options} = await postcssLoadConfig();
  const result = await postcss(plugins).process(content, {
    ...options,
    from: filename,
  });

  let processedCss = await minifyCss(result, filename);

  processedCss = escapeBackslashes(processedCss);

  return processedCss;
}

async function minifyCss(result, filename) {
  const minifyResult = await postcss([cssnano()]).process(result.css, {
    from: filename,
  });
  return minifyResult.css;
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
      colors.bgGreen('Successfully processed CSS file:'),
      colors.green(basename(srcPath))
    );
  } catch (err) {
    console.error(
      colors.bgRed('Error processing file:'),
      colors.green(basename(srcPath)),
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
    console.error(colors.bgRed(`Error reading directory: ${srcDir}`), err);
    throw err;
  }
  for (const entry of entries) {
    const srcPath = join(srcDir, entry.name);
    if (entry.isDirectory()) {
      await processCssFiles(srcPath, join(distDir, entry.name));
    } else if (entry.isFile() && entry.name.endsWith('.tw.css')) {
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
    const filePath = join(dir, name);
    const stat = statSync(filePath);
    if (stat.isDirectory()) {
      results = results.concat(getAllJsFiles(filePath));
    } else if (stat.isFile() && filePath.endsWith('.js')) {
      results.push(filePath);
    }
  }
  return results;
}

/**
 * Process all inline css`...` tagged template blocks in JS files through PostCSS/Tailwind
 */
async function processInlineCss(distDir, srcDir) {
  console.log(colors.bold.blue('Post-processing inline CSS'));
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

        const minified = await minifyCss(result, originalSrcFile);
        const escaped = escapeBackslashes(minified);

        content = content.split(fullMatch).join(`css\`${escaped}\``);
      }

      writeFileSync(file, content, 'utf8');
      // Color only the file name green, keep directory uncolored
      console.log(
        colors.bgGreen('Successfully processed inline CSS'),
        colors.green(basename(file))
      );
    } catch (err) {
      // Color only the file name green in error path
      console.error(
        colors.bgRed('Error processing inline CSS in file:'),
        colors.green(basename(file)),
        err
      );
      throw err;
    }
  }
}

export async function processAllCss(srcDir, distDir) {
  console.log(colors.bold.blue('Starting CSS processing'));

  await processCssFiles(srcDir, distDir);

  await processInlineCss(distDir, srcDir);

  console.log(colors.bold.blue('CSS processing complete'));
}
