import {basename, dirname, join, relative} from 'node:path';
import {argv} from 'node:process';
import {fileURLToPath} from 'node:url';
import {
  createProgram,
  DiagnosticCategory,
  flattenDiagnosticMessageText,
  getLineAndCharacterOfPosition,
  getPreEmitDiagnostics,
  parseJsonConfigFileContent,
  readConfigFile,
  sys,
} from 'typescript';
import colors from '../../../utils/ci/colors.mjs';
import resourceUrlTransformer from './asset-path-transformer.mjs';
import {generateCustomElementTags} from './generate-custom-element-tags.mjs';
import {generateLitExports} from './generate-lit-exports.mjs';
import pathTransformer from './path-transform.mjs';
import {processAllCss} from './process-css.mjs';
import svgTransformer from './svg-transform.mjs';
import versionTransformer from './version-transform.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const args = argv.slice(2);
const configArg = args.find((arg) => arg.startsWith('--config='));
if (configArg === undefined) {
  throw new Error('Missing --config=[PATH] argument');
}
const tsConfigPath = configArg.split('=')[1];
const isCDN = process.env.DEPLOYMENT_ENVIRONMENT === 'CDN';
const transformers = [
  pathTransformer,
  svgTransformer,
  versionTransformer,
  ...(isCDN ? [resourceUrlTransformer] : []),
];

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

function emit(program) {
  const targetSourceFile = undefined;
  const cancellationToken = undefined;
  const writeFile = undefined;
  const emitOnlyDtsFiles = false;
  const customTransformers = {
    before: transformers,
    afterDeclarations: [pathTransformer],
  };

  return program.emit(
    targetSourceFile,
    cancellationToken,
    writeFile,
    emitOnlyDtsFiles,
    customTransformers
  );
}

/**
 * Compiles TypeScript files using a custom transformer.
 *
 * This function mimics the behavior of running `tsc -p tsconfig.json` but applies a custom SVG transformer
 * to all TypeScript files. It loads the TypeScript configuration from the specified `tsconfig.json` file,
 * creates a TypeScript program, and emits the compiled JavaScript files with the custom transformer applied.
 *
 * Info: https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API#a-minimal-compiler
 */
function compileWithTransformer() {
  console.log(
    colors.blue('Using tsconfig:'),
    colors.green(basename(tsConfigPath))
  );
  const {options, fileNames} = loadTsConfig(tsConfigPath);
  const program = createProgram(fileNames, options);
  const emitResult = emit(program);

  const allDiagnostics = getPreEmitDiagnostics(program).concat(
    emitResult.diagnostics
  );

  let hasError = false;

  allDiagnostics.forEach((diagnostic) => {
    if (diagnostic.file) {
      const {line, character} = getLineAndCharacterOfPosition(
        diagnostic.file,
        diagnostic.start
      );
      const message = flattenDiagnosticMessageText(
        diagnostic.messageText,
        '\n'
      );

      console.log(
        `${colors.cyan(relative(process.cwd(), diagnostic.file.fileName))}:${colors.yellow(line + 1)}:${colors.yellow(character + 1)} - ${colors.red('error')} ${colors.gray(message)}`
      );
    } else {
      console.error(
        colors.red(flattenDiagnosticMessageText(diagnostic.messageText, '\n'))
      );
    }

    if (diagnostic.category === DiagnosticCategory.Error) {
      hasError = true;
    }
  });

  const exitCode = emitResult.emitSkipped || hasError ? 1 : 0;
  console.log(`Process exiting with code '${exitCode}'.`);
  return exitCode;
}

try {
  const {options} = loadTsConfig(tsConfigPath);

  const srcDir = join(__dirname, '../src');
  const outDir = options.outDir;

  console.log(colors.blue('Starting build process'));
  console.log(colors.blue('Generating custom element tags'));
  generateCustomElementTags();

  console.log(colors.blue('Generating Lit exports'));
  await generateLitExports();

  console.log(colors.blue('Starting TypeScript compilation'));
  const tsExitCode = compileWithTransformer();

  await processAllCss(srcDir, outDir);

  process.exit(tsExitCode);
} catch (error) {
  console.error(colors.red('Build failed:'), error);
  process.exit(1);
}
