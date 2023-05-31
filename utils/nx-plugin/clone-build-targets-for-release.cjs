/**
 * @typedef {import('@nrwl/devkit').ProjectGraphProjectNode} ProjectGraphProjectNode
 */

/**
 * @typedef {import('@nrwl/devkit').TargetConfiguration} TargetConfiguration
 */

/**
 * @typedef {import('@nrwl/devkit').TargetDependencyConfig} TargetDependencyConfig
 */

/**
 * @param {T[]} values
 * @returns {T}
 * @template {object} T
 */
function mergeObjects(...values) {
  return /** @type {T} */ (
    values.reduce(
      (merged, value) => ({...merged, ...value}),
      /** @type {Partial<T>} */ ({})
    )
  );
}

/**
 * @param {string | TargetDependencyConfig} dependency
 */
function isParentDependency(dependency) {
  if (typeof dependency === 'string') {
    return dependency.startsWith('^');
  }
  return dependency.projects === 'dependencies';
}

/**
 * @param {Readonly<Record<string, TargetConfiguration>>} projectTargets
 * @param {string} targetName
 * @returns {{target: TargetConfiguration, localDependencies: Record<string, TargetConfiguration>}}
 */
function cloneTarget(projectTargets, targetName) {
  const dependsOn = projectTargets[targetName].dependsOn;
  const dependenciesToClone = dependsOn
    ? dependsOn.filter(
        (targetDependency) => !isParentDependency(targetDependency)
      )
    : [];
  /** @type {Record<string, TargetConfiguration>} */
  const clonedDependencies = mergeObjects(
    ...dependenciesToClone.map((targetDependency) => {
      const targetDependencyName =
        typeof targetDependency === 'string'
          ? targetDependency
          : targetDependency.target;
      if (!(targetDependencyName in projectTargets)) {
        return {};
      }
      const {target: clonedDependency, localDependencies: deepDependencies} =
        cloneTarget(projectTargets, targetDependencyName);
      return {...deepDependencies, [targetDependencyName]: clonedDependency};
    })
  );
  return {
    target: JSON.parse(JSON.stringify(projectTargets[targetName])),
    localDependencies: clonedDependencies,
  };
}

/**
 * @param {TargetConfiguration} target
 * @param {string} dependencyToReplace E.g.: `build` or `^build`
 * @param {string[]} newDependencies
 */
function replaceDependency(target, dependencyToReplace, newDependencies) {
  if (!target.dependsOn) {
    return;
  }
  target.dependsOn = target.dependsOn.flatMap((dependency) => {
    if (typeof dependency === 'string') {
      if (dependency === dependencyToReplace) {
        return newDependencies;
      }
      return [/** @type {string | TargetDependencyConfig} */ (dependency)];
    }
    const targetToReplace = dependencyToReplace.startsWith('^')
      ? dependencyToReplace.slice(1)
      : dependencyToReplace;
    if (dependency.target === targetToReplace) {
      return newDependencies;
    }
    return [/** @type {string | TargetDependencyConfig} */ (dependency)];
  });
}

/**
 * @param {Record<string, TargetConfiguration>} targets
 * @param {string} oldName
 * @param {string} newName
 */
function renameTarget(targets, oldName, newName) {
  targets[newName] = targets[oldName];
  delete targets[oldName];
  for (const target of Object.values(targets)) {
    // We only cloned dependencies which are defined locally. We don't need to replace parent dependencies.
    replaceDependency(target, oldName, [newName]);
  }
}

/**
 * @param {ProjectGraphProjectNode} project
 */
function addReleaseBuildTargets(project) {
  const projectTargets = project.data.targets || {};
  if (!('build' in projectTargets)) {
    return;
  }
  const {target: buildTarget, localDependencies: buildTargetDependencies} =
    cloneTarget(projectTargets, 'build');
  const newTargets = {...buildTargetDependencies, 'release:build': buildTarget};
  for (const dependencyName of Object.keys(buildTargetDependencies)) {
    renameTarget(newTargets, dependencyName, `release:build:${dependencyName}`);
  }
  for (const target of Object.values(newTargets)) {
    replaceDependency(target, '^build', ['^release:build', 'release:phase1']);
  }
  project.data.targets = {...newTargets, ...projectTargets};
}

module.exports = {addReleaseBuildTargets};
