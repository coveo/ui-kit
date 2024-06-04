import ncp from 'ncp';
import {mkdirSync, readFileSync} from 'node:fs';
import {dirname, join, relative, resolve as resolvePath} from 'node:path';
import resolve from 'resolve';
import {promisify} from 'util';
import {workspacesRoot} from '../../../scripts/packages.mjs';

const ncpAsync = promisify(ncp);

/**
 *
 * @param {readonly V[]} values
 * @param {(value: V, index: number) => K} getKey
 * @template V
 * @template {PropertyKey} K
 * @returns {Record<K, V[]>}
 */
function aggregate(values, getKey) {
  return values.reduce((aggregatedValues, value, i) => {
    const key = getKey(value, i);
    if (!(key in aggregatedValues)) {
      aggregatedValues[key] = [];
    }
    aggregatedValues[key].push(value);
    return aggregatedValues;
  }, {});
}

/**
 * @typedef CDNAsset
 * @property {string} sourceDirectory Directory containing the required assets, relative to the root of the workspace.
 * @property {string[]} relativeDestinations Where the directory needs to be accessible from. For example: `atomic/storybook`.
 */

/**
 * @returns {CDNAsset[]}
 */
function getDeploymentPipelineAssets() {
  /**
   * @param {string} pipelineDirectory
   */
  function getRelativeDestination(pipelineDirectory) {
    const regexp =
      /^proda\/StaticCDN\/(?<packageName>[^\/]+)(?<version>\/v\$[^\/]+)(?<remainder>.*)?$/;
    const match = pipelineDirectory.match(regexp);
    if (!match) {
      throw `Could not parse ${pipelineDirectory} because it did not match the expected structure.`;
    }
    return `${match.groups.packageName}${match.groups.remainder || ''}`;
  }

  /**
   * @returns {{ ordered_phases: { s3?: { directory: string, source: string } }[] }}
   */
  function getDeploymentConfig() {
    const deploymentConfig = JSON.parse(
      readFileSync(resolvePath(workspacesRoot, '.deployment.config.json'))
        .toString()
        .replace(': $[ENVIRONMENTS]', ': []')
    );
    return deploymentConfig;
  }

  const deploymentConfig = getDeploymentConfig();
  const s3Phases = deploymentConfig.ordered_phases.filter(
    (phase) => 's3' in phase
  );
  const phasesBySource = aggregate(s3Phases, (phase) => phase.s3.source);
  /**
   * @type {CDNAsset[]}
   */
  const assets = [];
  for (const [source, phasesWithSameSource] of Object.entries(phasesBySource)) {
    if (source === 'packages/atomic/dist-storybook') {
      continue;
    }
    const relativeDestinations = new Set(
      phasesWithSameSource.map((phase) =>
        getRelativeDestination(phase.s3.directory)
      )
    );
    assets.push({
      sourceDirectory: source,
      relativeDestinations: Array.from(relativeDestinations),
    });
  }
  return assets;
}

/**
 * @returns {CDNAsset[]}
 */
function getDependencyAssets() {
  /**
   * @param {string} dependencyName
   * @param {string[]} parts
   */
  function getDependencyDirectory(dependencyName) {
    return relative(
      workspacesRoot,
      dirname(resolve.sync(`${dependencyName}/package.json`))
    );
  }

  return ['react', 'react-dom', '@babel/standalone'].map((dependencyName) => ({
    sourceDirectory: getDependencyDirectory(dependencyName),
    relativeDestinations: [join('deps', dependencyName)],
  }));
}

async function main() {
  const assets = [...getDeploymentPipelineAssets(), ...getDependencyAssets()];
  for (const asset of assets) {
    for (const relativeDestination of asset.relativeDestinations) {
      const sourceDir = join(workspacesRoot, asset.sourceDirectory);
      const destinationDir = resolvePath('www', 'cdn', relativeDestination);
      mkdirSync(destinationDir, {recursive: true});
      await ncpAsync(sourceDir, destinationDir);
    }
  }
}

await main();
