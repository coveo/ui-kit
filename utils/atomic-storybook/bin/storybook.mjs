#!/usr/bin/env node
import {existsSync, readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execute} from '../../../scripts/exec.mjs';
import {workspacesRoot} from '../../../scripts/packages.mjs';

const atomicStorybookPackageDir = resolve(
  fileURLToPath(import.meta.url),
  '..',
  '..'
);

const callerRoot = process.cwd();

const binDirectories = [
  resolve(atomicStorybookPackageDir, 'node_modules', '.bin'),
  resolve(workspacesRoot, 'node_modules', '.bin'),
];

/**
 * @param {string[]} allParams
 */
function buildStorybookParametersAndEnvironment(allParams) {
  /**
   * @type {{configDir: string, staticDir: string, outputDir: string, stories: string[], stencilDocs: string}}
   */
  const params = {
    configDir: resolve(atomicStorybookPackageDir, '.storybook'),
    staticDir: resolve(callerRoot, 'dist'),
    outputDir: resolve(callerRoot, 'storybook-static'),
    stories: ['./src/**/*.stories.mdx', './src/**/*.stories.tsx'].map(
      (storyGlob) => resolve(callerRoot, storyGlob)
    ),
    stencilDocs: readFileSync(resolve(callerRoot, 'docs', 'atomic-docs.json')),
  };
  return {
    parameters: [
      '--config-dir',
      params.configDir,
      '--static-dir',
      params.staticDir,
      '--output-dir',
      params.outputDir,
    ],
    environment: {
      STORYBOOK_STENCIL_STORIES: JSON.stringify(params.stories),
      STORYBOOK_STENCIL_DOCS: params.stencilDocs,
      STORYBOOK_CALLER: callerRoot,
    },
  };
}

/**
 * @param {string} name
 */
function findBinary(name) {
  const fileName = binDirectories
    .map((binDirectory) => resolve(binDirectory, name))
    .find((fileName) => existsSync(fileName));
  if (!fileName) {
    throw `Could not find binary for ${name}.`;
  }
  return fileName;
}

/**
 * @param {string} command
 * @param {string[]} allParams
 */
async function main(command, ...allParams) {
  switch (command) {
    case 'build':
    case 'start':
      const {parameters, environment} =
        buildStorybookParametersAndEnvironment(allParams);
      Object.assign(process.env, environment);
      command === 'build'
        ? await execute(findBinary('build-storybook'), parameters, {
            cwd: atomicStorybookPackageDir,
          })
        : await execute(
            findBinary('start-storybook'),
            [...parameters, ...['-p', '6006']],
            {cwd: atomicStorybookPackageDir}
          );
      return;
    case 'analyze':
      await execute(findBinary('lit-analyzer'), allParams, {
        cwd: atomicStorybookPackageDir,
      });
      return;
    default:
      throw 'Invalid command';
  }
}

await main(...process.argv.slice(2));
