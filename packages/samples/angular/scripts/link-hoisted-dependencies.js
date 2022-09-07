// TODO: remove this script when nohoist (https://github.com/npm/rfcs/issues/287) is introduced.

const {execSync} = require('child_process');
const {existsSync, symlinkSync, mkdirSync} = require('fs');
const {join, parse} = require('path');

/** @param {string} dependency */
function getLocalPathToDependency(dependency) {
  return join(__dirname, '../node_modules', dependency);
}

/** @param {string} dependency */
function getHoistedPathToDependency(dependency) {
  return join(__dirname, '../../../../node_modules', dependency);
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
