import {readdirSync, statSync} from 'node:fs';
import {resolve} from 'node:path';
import {execute} from '../../exec.mjs';

async function setup() {
  console.log('setting up repositories');
  await execute('pnpm', ['install', '--frozen-lockfile']);
}

async function buildFiles() {
  console.log('building files');
  await execute('npx', ['turbo', '@coveo/headless#build']);
}

function readFileSizes() {
  console.log('getting file sizes');
  const dir = resolve('packages', 'headless', 'cdn');
  const entries = getUseCasesAndFilePaths(dir);

  const sizeEntries = entries.map((entry) => {
    const {useCase, filePath} = entry;
    const {size} = statSync(filePath);
    return [useCase, size];
  });

  return Object.fromEntries(sizeEntries);
}

function getUseCasesAndFilePaths(dir) {
  const filePaths = getEsmFilePaths(dir);

  return filePaths.map((filePath) => ({
    useCase: determineUseCase(dir, filePath),
    filePath,
  }));
}

function getEsmFilePaths(dir) {
  const paths = getFilePaths(dir);
  return paths.filter((path) => path.endsWith('.esm.js'));
}

function getFilePaths(dir, files = []) {
  const names = readdirSync(dir);

  const resolvedPaths = names.flatMap((name) => {
    const currentPath = `${dir}/${name}`;
    return statSync(currentPath).isDirectory()
      ? getFilePaths(currentPath)
      : [currentPath];
  });

  return files.concat(resolvedPaths);
}

function determineUseCase(dir, filePath) {
  const pathRelativeToDir = filePath.slice(dir.length);
  const parts = pathRelativeToDir.split('/');
  return parts.length > 2 ? parts[1] : 'search';
}

export async function computeFileSizes() {
  await setup();
  await buildFiles();
  return readFileSizes();
}
