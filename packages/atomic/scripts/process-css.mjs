import chalk from 'chalk';
import {readdir, mkdir, readFile, writeFile} from 'fs';
import * as lightningcss from 'lightningcss';
import {join, dirname, relative} from 'path';
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
  return new Promise((resolve, reject) => {
    readFile(srcPath, 'utf8', async (err, data) => {
      if (err) {
        console.error(chalk.red(`Error reading file: ${srcPath}`));
        return reject(err);
      }

      const files = [file];

      console.log(
        chalk.blue('Processing:'),
        chalk.green(`${srcPath} -> ${distPath}`)
      );

      try {
        const imports = Array.from(data.matchAll(importMatcher)).flatMap(
          (match) => match
        );
        pushImports(srcPath, imports, files);
        const cleanedData = data.replace(importWholeLineMatcher, '');

        const result = await processAndMinifyCss(cleanedData, srcPath);

        let importIndex = 0;
        const fileContent = dedent`
        ${imports.length > 0 ? imports.map((importPath) => `import dep${importIndex++} from '${importPath.replace(/\.css$/, '.css.js')}';`).join('\n') : ''}${cssToJs(result)}
        ${
          imports.length > 0
            ? `const allCss = [${imports
                .map((_, index) => `...dep${index}`)
                .concat('css')
                .join(', ')}];
        export default allCss;
        `
            : `export default [css];
`
        }
        `;
        const jsPath = distPath + '.js';

        writeFile(jsPath, fileContent, (writeErr) => {
          if (writeErr) {
            console.error(chalk.red(`Error writing file: ${jsPath}`));
            return reject(writeErr);
          }
          console.log(
            chalk.blue('Successfully processed:'),
            chalk.green(jsPath)
          );
          resolve();
        });
      } catch (processError) {
        console.error(
          chalk.red(`Error processing file: ${srcPath}`),
          processError
        );
        reject(processError);
      }
    });
  });
}

export async function processCssFiles(srcDir, distDir) {
  return new Promise((resolve, reject) => {
    readdir(srcDir, {withFileTypes: true}, async (err, files) => {
      if (err) {
        console.error(chalk.red(`Error reading directory: ${srcDir}`));
        return reject(err);
      }

      try {
        const processingPromises = files.map((file) => {
          return new Promise((fileResolve, fileReject) => {
            const srcPath = join(srcDir, file.name);

            if (file.isDirectory()) {
              processCssFiles(srcPath, join(distDir, file.name))
                .then(fileResolve)
                .catch(fileReject);
            } else if (file.isFile() && file.name.endsWith('.css')) {
              const relPath = relative(srcDir, srcPath);
              const distPath = join(distDir, relPath);
              const targetDir = dirname(distPath);
              console.log(
                chalk.blue('Processing CSS for:'),
                chalk.green(srcPath)
              );

              mkdir(targetDir, {recursive: true}, (mkdirErr) => {
                if (mkdirErr) {
                  console.error(
                    chalk.red(`Error creating directory: ${targetDir}`)
                  );
                  return fileReject(mkdirErr);
                }

                convertCssToJs(srcPath, distPath, file)
                  .then(fileResolve)
                  .catch(fileReject);
              });
            } else {
              fileResolve();
            }
          });
        });
        await Promise.all(processingPromises);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  });
}
