const exportModule = require('./_loader.cjs.js');
const searchComponents = import(
  '../atomic/components/components/search/lazy-index.js'
);
const commerceComponents = import(
  '../atomic/components/components/commerce/lazy-index.js'
);

const originalDefineCustomElements = exportModule.defineCustomElements;
exportModule.defineCustomElements = function (...args) {
  Promise.all[(searchComponents, commerceComponents)].then((module) =>
    Object.values(module).forEach((importFunction) => importFunction())
  );
  originalDefineCustomElements(...args);
};

module.exports = exportModule;
