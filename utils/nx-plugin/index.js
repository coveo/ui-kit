const {
  addReleaseBuildTargets,
} = require('./clone-build-targets-for-release.cjs');

module.exports = /** @type {import('@nrwl/devkit').NxPlugin} */ ({
  name: '@coveo/nx-plugin',
  processProjectGraph(currentGraph) {
    for (const node of Object.values(currentGraph.nodes)) {
      addReleaseBuildTargets(node);
    }
    return currentGraph;
  },
});
