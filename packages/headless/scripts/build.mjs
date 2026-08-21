import {basename, dirname, relative} from 'node:path';
import {argv} from 'node:process';
import {fileURLToPath} from 'node:url';
import {
  createEmitAndSemanticDiagnosticsBuilderProgram,
  createProgram,
  createWatchCompilerHost,
  createWatchProgram,
  DiagnosticCategory,
  flattenDiagnosticMessageText,
  formatDiagnostic,
  getLineAndCharacterOfPosition,
  getPreEmitDiagnostics,
  parseJsonConfigFileContent,
  readConfigFile,
  sys,
} from 'typescript';
import colors from '../../../utils/ci/colors.mjs';

import analyticsTransformer from './analytics-transform.mjs';
import versionTransformer from './version-transform.mjs';
import wildcardExportTransformer from './wildcard-export-transform.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const args = argv.slice(2);
const configArg = args.find((arg) => arg.startsWith('--config='));
if (configArg === undefined) {
  throw new Error('Missing --config=[PATH] argument');
}
const tsConfigPath = configArg.split('=')[1];
const watchMode = args.includes('--watch');
const transformers = [versionTransformer, analyticsTransformer, wildcardExportTransformer];

function loadTsConfig(configPath) {
  const configFile = readConfigFile(configPath, sys.readFile);
  if (configFile.error) {
    throw new Error(`Error loading tsconfig file: ${configFile.error.messageText}`);
  }
  return parseJsonConfigFileContent(configFile.config, sys, dirname(configPath));
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
  console.log(colors.blue('Using tsconfig:'), colors.green(basename(tsConfigPath)));
  const {options, fileNames} = loadTsConfig(tsConfigPath);
  const program = createProgram(fileNames, options);
  const emitResult = emit(program);

  const allDiagnostics = getPreEmitDiagnostics(program).concat(emitResult.diagnostics);

  let hasError = false;

  allDiagnostics.forEach((diagnostic) => {
    if (diagnostic.file) {
      const {line, character} = getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start);
      const message = flattenDiagnosticMessageText(diagnostic.messageText, '\n');

      console.log(
        `${colors.cyan(relative(process.cwd(), diagnostic.file.fileName))}:${colors.yellow(line + 1)}:${colors.yellow(character + 1)} - ${colors.red('error')} ${colors.gray(message)}`
      );
    } else {
      console.error(colors.red(flattenDiagnosticMessageText(diagnostic.messageText, '\n')));
    }

    if (diagnostic.category === DiagnosticCategory.Error) {
      hasError = true;
    }
  });

  const exitCode = emitResult.emitSkipped || hasError ? 1 : 0;
  console.log(`Process exiting with code '${exitCode}'.`);
  process.exit(exitCode);
}

/**
 * Recompiles on every change, applying the same custom transformers as a one-shot build.
 *
 * TypeScript's watch API emits through the builder program it creates, so the transformers
 * have to be injected by taking over `afterProgramCreate` rather than by calling `emit`
 * directly as the one-shot path does. The write callback is supplied explicitly because the
 * watch host does not persist emitted output on its own.
 */
function watchWithTransformer() {
  console.log(colors.blue('Using tsconfig:'), colors.green(basename(tsConfigPath)));

  const host = createWatchCompilerHost(
    tsConfigPath,
    {},
    sys,
    createEmitAndSemanticDiagnosticsBuilderProgram,
    (diagnostic) => process.stderr.write(formatDiagnostic(diagnostic, formatHost)),
    (diagnostic) =>
      console.log(colors.blue(flattenDiagnosticMessageText(diagnostic.messageText, '\n')))
  );

  host.afterProgramCreate = (builderProgram) => {
    let emittedFileCount = 0;
    const targetSourceFile = undefined;
    const cancellationToken = undefined;
    const emitOnlyDtsFiles = false;

    builderProgram.emit(
      targetSourceFile,
      (fileName, text, writeByteOrderMark) => {
        sys.writeFile(fileName, text, writeByteOrderMark);
        emittedFileCount++;
      },
      cancellationToken,
      emitOnlyDtsFiles,
      {before: transformers}
    );

    console.log(colors.green(`Emitted ${emittedFileCount} files.`));
  };

  watchProgram = createWatchProgram(host);
}

let watchProgram;

const formatHost = {
  getCanonicalFileName: (fileName) => fileName,
  getCurrentDirectory: sys.getCurrentDirectory,
  getNewLine: () => sys.newLine,
};

try {
  console.log(colors.blue('Starting TypeScript compilation'));
  if (watchMode) {
    watchWithTransformer();
  } else {
    compileWithTransformer();
  }
} catch (error) {
  console.error(colors.red('Build failed:'), error);
  process.exit(1);
}
