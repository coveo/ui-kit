import {readdir, mkdir, readFile, writeFile} from 'fs';
import * as lightningcss from 'lightningcss';
import {join, dirname, relative} from 'path';
import postcss from 'postcss';
import postcssLoadConfig from 'postcss-load-config';
import {argv} from 'process';
import {dedent} from 'ts-dedent';
import {parseJsonConfigFileContent, readConfigFile, sys} from 'typescript';
import {fileURLToPath} from 'url';

const args = argv.slice(2);
const configArg = args.find((arg) => arg.startsWith('--config='));
if (configArg === undefined) {
  throw new Error('Missing --config=[PATH] argument');
}
const tsConfigPath = configArg.split('=')[1];

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const srcDir = join(__dirname, '../src');
const {options} = loadTsConfig(tsConfigPath);
const distDir = options.outDir;

function loadTsConfig(configPath) {
  const configFile = readConfigFile(configPath, sys.readFile);
  if (configFile.error) {
    throw new Error(
      `Error loading tsconfig file: ${configFile.error.messageText}`
    );
  }
  return parseJsonConfigFileContent(
    configFile.config,
    sys,
    dirname(configPath)
  );
}

async function processAndMinifyCss(content, filename) {
  const {plugins, options} = await postcssLoadConfig();
  const result = await postcss(plugins).process(content, {
    ...options,
    from: filename,
  });

  let processedCss = minifyCss(result, filename);

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

const importMatcher = /(?<=^@import\s+').*\.css(?=';$)/gm;
const importWholeLineMatcher = /^@import\s+'.*\.css';$/gm;

const pushImports = (currentFile, importPaths, files) => {
  for (const importPath of importPaths) {
    const resolvedPath = join(dirname(currentFile), importPath);
    if (!files.includes(resolvedPath)) {
      files.push(resolvedPath);
    }
  }
};

function convertCssToJs(srcPath, distPath, file) {
  readFile(srcPath, 'utf8', async (err, data) => {
    if (err) {
      throw err;
    }

    const files = [file];

    console.log(`Processing ${srcPath} -> ${distPath}`);
    const imports = Array.from(data.matchAll(importMatcher)).flatMap(
      (match) => match
    );
    pushImports(srcPath, imports, files);
    data = data.replace(importWholeLineMatcher, '');

    const result = await processAndMinifyCss(data, srcPath);

    let importIndex = 0;
    const fileContent = dedent`
    ${imports.length > 0 ? imports.map((importPath) => `import dep${importIndex++} from '${importPath.replace(/\.css$/, '.css.js')}';`).join('\n') : ''}
    ${cssToJs(result)}
    ${
      imports.length > 0
        ? `
    const allCss = [${imports
      .map((_, index) => `...dep${index}`)
      .concat('css')
      .join(', ')}];
    export default allCss;
    `
        : `
    export default [css];
    `
    }
    `;
    const jsPath = distPath + '.js';

    writeFile(jsPath, fileContent, (err) => {
      if (err) {
        throw err;
      }
    });
  });
}

function processCssFiles(srcDir, distDir) {
  readdir(srcDir, {withFileTypes: true}, (err, files) => {
    if (err) {
      throw err;
    }

    files.forEach((file) => {
      const srcPath = join(srcDir, file.name);

      if (file.isDirectory()) {
        processCssFiles(srcPath, join(distDir, file.name));
      } else if (file.isFile() && file.name.endsWith('.css')) {
        const relPath = relative(srcDir, srcPath);
        const distPath = join(distDir, relPath);
        const targetDir = dirname(distPath);
        console.log(`Processing CSS for ${srcPath}`);

        mkdir(targetDir, {recursive: true}, (err) => {
          if (err) {
            throw err;
          }
          convertCssToJs(srcPath, distPath, file);
        });
      }
    });
  });
}

processCssFiles(srcDir, distDir);
