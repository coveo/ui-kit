import {readFile, writeFile, readFileSync, existsSync, mkdirSync} from 'fs';
import * as lightningcss from 'lightningcss';
import {join, dirname, basename, resolve} from 'path';
import postcss from 'postcss';
import postcssLoadConfig from 'postcss-load-config';
import {argv} from 'process';
import {
  readConfigFile,
  sys,
  parseJsonConfigFileContent,
  isImportDeclaration,
  forEachChild,
  createSourceFile,
  ScriptTarget,
  isExportDeclaration,
  resolveModuleName,
} from 'typescript';

const args = argv.slice(2);
const configArg = args.find((arg) => arg.startsWith('--config='));
if (configArg === undefined) {
  throw new Error('Missing --config=[PATH] argument');
}
const tsConfigPath = configArg.split('=')[1];

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

function escapeString(str) {
  return str.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');
}

function convertCssToJs(srcPath, distPath, file) {
  readFile(srcPath, 'utf8', async (err, data) => {
    if (err) {
      throw err;
    }

    const processedCss = await processAndMinifyCss(data, srcPath);
    const jsContent = `export default \`${escapeString(processedCss)}\`;`;
    const jsPath = distPath + '.js';

    writeFile(jsPath, jsContent, (err) => {
      if (err) {
        throw err;
      }
    });
  });
}

const moduleResolutionHost = {
  fileExists: (filePath) => existsSync(filePath),
  readFile: (filePath) => {
    try {
      return readFileSync(filePath, 'utf8');
    } catch {
      return undefined;
    }
  },
};

const alreadyResolved = new Set(); // TODO: do not make global
const compilerOptions = {
  target: ScriptTarget.ES2021,
};

const resolveAndAddImport = (containingFile, importPath) => {
  const {resolvedModule} = resolveModuleName(
    importPath,
    containingFile,
    compilerOptions,
    moduleResolutionHost
  );

  if (!resolvedModule) {
    return null;
  }

  return resolvedModule.resolvedFileName;
};

function visit(node, currentFile) {
  // TODO: export should be treated differently

  if (isExportDeclaration(node)) {
    if (node.moduleSpecifier === undefined) {
      return;
    }
    const importPath = node.moduleSpecifier.getText().slice(1, -1); // Remove quotes
    const resolvedFileName = resolveAndAddImport(currentFile, importPath);

    if (resolvedFileName && !alreadyResolved.has(resolvedFileName)) {
      alreadyResolved.add(resolvedFileName);
      const fileContent = readFileSync(resolvedFileName, 'utf-8');
      const sourceFile = getSourceFile(resolvedFileName, fileContent);
      forEachChild(sourceFile, (childNode) =>
        visit(childNode, resolvedFileName)
      );
    }
  }

  if (isImportDeclaration(node)) {
    const importPath = node.moduleSpecifier.text;
    if (importPath.endsWith('.tw.css')) {
      console.log('Processing CSS for:', basename(importPath));
      const dir = dirname(node.getSourceFile().fileName);
      const sourcePath = resolve(dir, importPath);
      const distPath = join(distDir, importPath);

      mkdirSync(dirname(distPath), {recursive: true});
      return convertCssToJs(sourcePath, distPath);
    }
  }
}

function getSourceFile(containingFile, fileContent) {
  return createSourceFile(
    containingFile,
    fileContent,
    ScriptTarget.ES2021,
    true // SetParentNodes - useful for AST transformations
  );
}

const {options, fileNames} = loadTsConfig(tsConfigPath);
const distDir = options.outDir;

fileNames.forEach((fileName) => {
  const fileContent = readFileSync(fileName, 'utf-8');
  const sourceFile = getSourceFile(fileName, fileContent);
  forEachChild(sourceFile, (node) => visit(node, fileName));
});
// const filePath = fileNames[0];
// const fileContent = readFileSync(filePath, 'utf-8');
// const sourceFile = getSourceFile(filePath, fileContent);

// forEachChild(sourceFile, (node) => visit(node, filePath));
