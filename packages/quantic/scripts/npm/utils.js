function quanticIsDependency() {
  try {
    // path to npm scripts is expected to be: project_name/node_modules/@coveo/quantic/scripts/npm
    require.resolve('@coveo/quantic/scripts/npm/utils.js');
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
