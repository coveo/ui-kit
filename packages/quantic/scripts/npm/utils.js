const pathlib = require('path');

function quanticIsDependency() {
  try {
    // path to npm scripts is expected to be: project_name/node_modules/@coveo/quantic/scripts/npm
    const upperDirectories = __dirname.split(pathlib.sep);
    const dirCountAfterNodeModulesParent = 5;
    const nodeModulesParent = upperDirectories.slice(
      0,
      -dirCountAfterNodeModulesParent
    );
    require.resolve(
      pathlib.join(
        nodeModulesParent.join(pathlib.sep),
        'node_modules',
        '@coveo',
        'quantic',
        'scripts',
        'npm',
        'utils.js'
      )
    );
    return true;
  } catch (err) {
    if (err.code !== 'MODULE_NOT_FOUND') {
      console.error(err);
    }
    return false;
  }
}

function getProjectPath() {
  return __dirname.split('/node_modules')[0];
}

module.exports = {
  quanticIsDependency,
  getProjectPath,
};
