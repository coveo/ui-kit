import {dirname, basename} from 'path';
import {argv} from 'process';
import {
  readConfigFile,
  getLineAndCharacterOfPosition,
  sys,
  parseJsonConfigFileContent,
  getPreEmitDiagnostics,
  createProgram,
  flattenDiagnosticMessageText,
} from 'typescript';
import resourceUrlTransformer from './asset-path-transformer.mjs';
import pathTransformer from './path-transform.mjs';
import svgTransformer from './svg-transform.mjs';

const args = argv.slice(2);
const configArg = args.find((arg) => arg.startsWith('--config='));
if (configArg === undefined) {
  throw new Error('Missing --config=[PATH] argument');
}
const tsConfigPath = configArg.split('=')[1];
const isCDN = process.env.DEPLOYMENT_ENVIRONMENT === 'CDN';
const transformers = [
  svgTransformer,
  pathTransformer,
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
  console.log('Using tsconfig:', basename(tsConfigPath));
  const {options, fileNames} = loadTsConfig(tsConfigPath);
  const program = createProgram(fileNames, options);
  const emitResult = emit(program);

  const allDiagnostics = getPreEmitDiagnostics(program).concat(
    emitResult.diagnostics
  );

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
        `${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`
      );
    } else {
      console.error(flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
    }
  });

  let exitCode = emitResult.emitSkipped ? 1 : 0;
  console.log(`Process exiting with code '${exitCode}'.`);
  process.exit(exitCode);
}

compileWithTransformer();
