const exportModule = require('./_loader.cjs.js');
const searchComponents = import(
  '../components/components/search/lazy-index.js'
);

const originalDefineCustomElements = exportModule.defineCustomElements;
exportModule.defineCustomElements = function (...args) {
  searchComponents.then((module) =>
    Object.values(module).forEach((importFunction) => importFunction())
  );
  originalDefineCustomElements(...args);
};

module.exports = exportModule;
