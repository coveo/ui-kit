import {basename, dirname, relative} from 'node:path';
import {argv} from 'node:process';
import {fileURLToPath} from 'node:url';
import chalk from 'chalk';
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
import analyticsTransformer from './analytics-transform.mjs';
import versionTransformer from './version-transform.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const args = argv.slice(2);
const configArg = args.find((arg) => arg.startsWith('--config='));
if (configArg === undefined) {
  throw new Error('Missing --config=[PATH] argument');
}
const tsConfigPath = configArg.split('=')[1];
const transformers = [versionTransformer, analyticsTransformer];

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
 * This function mimics the behavior of running `tsc -p tsconfig.json` but applies a custom transformer to substitute the version and resolve some import issue with coveo.analytics
 * to all TypeScript files. It loads the TypeScript configuration from the specified `tsconfig.json` file,
 * creates a TypeScript program, and emits the compiled JavaScript files with the custom transformer applied.
 *
 * Info: https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API#a-minimal-compiler
 */
function compileWithTransformer() {
  console.log(
    chalk.blue('Using tsconfig:'),
    chalk.green(basename(tsConfigPath))
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
        `${chalk.cyan(relative(process.cwd(), diagnostic.file.fileName))}:${chalk.yellow(line + 1)}:${chalk.yellow(character + 1)} - ${chalk.red('error')} ${chalk.gray(message)}`
      );
    } else {
      console.error(
        chalk.red(flattenDiagnosticMessageText(diagnostic.messageText, '\n'))
      );
    }

    if (diagnostic.category === DiagnosticCategory.Error) {
      hasError = true;
    }
  });

  const exitCode = emitResult.emitSkipped || hasError ? 1 : 0;
  console.log(`Process exiting with code '${exitCode}'.`);
  process.exit(exitCode);
}

try {
  console.log(chalk.blue('Starting TypeScript compilation'));
  compileWithTransformer();
} catch (error) {
  console.error(chalk.red('Build failed:'), error);
  process.exit(1);
}
