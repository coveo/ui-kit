// TODO: remove this script when nohoist (https://github.com/npm/rfcs/issues/287) is introduced.
import {execSync} from 'child_process';
import {existsSync, symlinkSync, mkdirSync} from 'fs';
import {resolve, parse} from 'path';

/** @param {string} dependency */
function getLocalPathToDependency(dependency) {
  return resolve('node_modules', dependency);
}

/** @param {string} dependency */
function getHoistedPathToDependency(dependency) {
  return resolve('..', '..', '..', 'node_modules', dependency);
}

/** @param {string} path */
function ensurePathExists(path) {
  const {dir} = parse(path);
  if (!existsSync(dir)) {
    mkdirSync(dir, {recursive: true});
  }
}

function getUnlinkedDependencies() {
  /** @type {'' | `${string}:${string}@${string}`} */
  const listOutput = execSync('npm list -alp').toString();

  const dependencies = Array.from(
    listOutput.matchAll(
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      /^[^:\n]+:(?<dependencyName>[^:\n]+)@[^:\n]+(:[^:\n]+)?$/gm
    )
  ).map((match) => match.groups['dependencyName']);

  const uniqueDependencies = Array.from(new Set(dependencies));

  const unlinkedDependencies = uniqueDependencies.filter(
    (dependency) => !existsSync(getLocalPathToDependency(dependency))
  );

  return unlinkedDependencies;
}

/** @param {string} dependency */
function linkDependency(dependency) {
  const hoistedPath = getHoistedPathToDependency(dependency);
  if (!existsSync(hoistedPath)) {
    return false;
  }

  const localPath = getLocalPathToDependency(dependency);
  ensurePathExists(localPath);
  symlinkSync(hoistedPath, localPath, 'dir');
  return true;
}

const unlinkedDependencies = getUnlinkedDependencies();

const newLinks = unlinkedDependencies.filter((dependency) =>
  linkDependency(dependency)
);

console.info(`linked ${newLinks.length} dependencies.`);
