#!/usr/bin/env node
import Arborist from '@npmcli/arborist';
import {DepGraph} from 'dependency-graph';
import {REPO_FS_ROOT} from './common/constants.mjs';

if (!process.env.INIT_CWD) {
  throw new Error('Should be called using npm run-script');
}
process.chdir(process.env.INIT_CWD);

/**
 * Current strategy: reify each package (along with their dependants transitively) in topological (parents->dependants) order.
 *
 * Other (untested) strategies that may work:
 * * Strategy A: reify each package individually in topological (parents->dependants) order.
 * * Strategy B: reify all packages at once.
 */

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
    const workspaces = edgesOut.filter(
      (edge) =>
        edge.to &&
        edge.to.package.name &&
        rootNode.workspaces?.has(edge.to.package.name)
    );
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
      if (!node.package.name || !dependency || !dependency.package.name) {
        throw 'Workspaces must all have a name.';
      }
      if (node.package.name === dependency.package.name) {
        continue;
      }
      graph.addDependency(node.package.name, dependency.package.name);
      addWorkspaceDependencies(dependency);
    }
  }

  const workspaces = getWorkspaceDependencies(rootNode);
  for (const workspace of workspaces) {
    if (!workspace || !workspace.package.name) {
      throw 'Workspaces must all have a name.';
    }
    graph.addNode(workspace.package.name, workspace);
  }
  for (const workspace of workspaces) {
    if (workspace) {
      addWorkspaceDependencies(workspace);
    }
  }
  return graph;
}

async function initArborist() {
  const registry = process.env.npm_config_registry;
  const arb = new Arborist({
    savePrefix: '',
    path: REPO_FS_ROOT,
    registry,
  });
  console.log('Loading virtual tree.');
  await arb.loadVirtual();
  return arb;
}

const graph = buildDependencyGraph(
  /** @type {Arborist.Node} */ ((await initArborist()).virtualTree)
);
for (const packageToUpdate of graph.overallOrder()) {
  const names = [
    packageToUpdate,
    ...graph.dependantsOf(packageToUpdate),
  ].flatMap((packageName) => [
    graph.getNodeData(packageName).name,
    packageName,
  ]);
  console.log('Updating package-lock for', names);
  const arb = await initArborist();
  console.log('Building ideal tree');
  await arb.buildIdealTree({
    update: {
      names,
    },
  });
  console.log('Applying ideal tree.');
  await arb.reify();
}
