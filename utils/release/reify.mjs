#!/usr/bin/env node
import Arborist from '@npmcli/arborist';
import {DepGraph} from 'dependency-graph';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

/**
 * @typedef {Map<string, Omit<Arborist.Edge, 'to'> & {workspace: boolean, to: Arborist.Link}>} EdgeMap
 */

/**
 * @param {Arborist.Node} rootNode
 */
function buildDependencyGraph(rootNode) {
  const graph = /** @type {DepGraph<Arborist.Node>} */ (new DepGraph());
  /**
   * @param {Arborist.Node} node
   */
  function getWorkspaceDependencies(node) {
    const edgesOut =
      node.edgesOut instanceof Map
        ? Array.from(node.edgesOut.values())
        : node.edgesOut;
    const workspaces = edgesOut.filter((edge) => edge.workspace);
    return workspaces.map((edge) =>
      edge.to instanceof Arborist.Link ? edge.to.target : edge.to
    );
  }

  /**
   * @param {Arborist.Node} node
   */
  function addWorkspaceDependencies(node) {
    const dependencies = getWorkspaceDependencies(node);
    for (const dependency of dependencies) {
      graph.addDependency(node.name, dependency.name);
      addWorkspaceDependencies(dependency);
    }
  }

  const workspaces = getWorkspaceDependencies(rootNode);
  for (const workspace of workspaces) {
    graph.addNode(workspace.name, workspace);
  }
  for (const workspace of workspaces) {
    addWorkspaceDependencies(workspace);
  }
  return graph;
}

const rootFolder = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

const arb = new Arborist({
  savePrefix: '',
  path: rootFolder,
  registry: process.env.npm_config_registry,
  _authToken: 'invalid', // TODO: Remove when removing Lerna
});
console.log('Loading virtual tree.');
await arb.loadVirtual();
const packagesToUpdate = buildDependencyGraph(
  /** @type {Arborist.Node} */ (arb.virtualTree)
).overallOrder();
console.log(
  'Building ideal tree. The following packages will be updated:',
  packagesToUpdate
);
await arb.buildIdealTree({
  update: {
    names: packagesToUpdate,
  },
});
console.log('Applying ideal tree.');
await arb.reify();
