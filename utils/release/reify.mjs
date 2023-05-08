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
    const workspaces = edgesOut.filter((edge) => /** @type {Arborist.Edge & {workspace: boolean}} */ (edge).workspace);
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
      if (!node.package.name || !dependency.package.name) {
        throw 'Workspaces must all have a name.';
      }
      graph.addDependency(node.package.name, dependency.package.name);
      addWorkspaceDependencies(dependency);
    }
  }

  const workspaces = getWorkspaceDependencies(rootNode);
  for (const workspace of workspaces) {
    if (!workspace.package.name) {
      throw 'Workspaces must all have a name.';
    }
    graph.addNode(workspace.package.name, workspace);
  }
  for (const workspace of workspaces) {
    addWorkspaceDependencies(workspace);
  }
  return graph;
}

async function initArborist() {
  const arb = new Arborist({
    savePrefix: '',
    path: rootFolder,
    registry: process.env.npm_config_registry,
    _authToken: 'invalid', // TODO: Remove when removing Lerna
  });
  console.log('Loading virtual tree.');
  await arb.loadVirtual();
  return arb;
}

const rootFolder = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

const graph = buildDependencyGraph(
  /** @type {Arborist.Node} */ ((await initArborist()).virtualTree)
)
const packagesToUpdate = graph.overallOrder();
for (const packageName of packagesToUpdate) {
  console.log('Updating package-lock for', packageName);
  const arb = await initArborist();
  console.log('Building ideal tree');
  await arb.buildIdealTree({
    update: {
      names: [graph.getNodeData(packageName).name, packageName],
    },
  });
  console.log('Applying ideal tree.');
  await arb.reify();
}
