const exportModule = require('./_loader.cjs.js');
const searchComponents = import(
  '../atomic/components/components/search/lazy-index.js'
);
const commerceComponents = import(
  '../atomic/components/components/commerce/lazy-index.js'
);
const insightComponents = import(
  '../atomic/components/components/insight/lazy-index.js'
);
const ipxComponents = import(
  '../atomic/components/components/ipx/lazy-index.js'
);
const recommendationsComponents = import(
  '../atomic/components/components/recommendations/lazy-index.js'
);

const allComponents = Promise.all([
  searchComponents,
  commerceComponents,
  insightComponents,
  ipxComponents,
  recommendationsComponents,
]);

const originalDefineCustomElements = exportModule.defineCustomElements;
exportModule.defineCustomElements = function (...args) {
  allComponents.then((modules) => {
    modules.forEach((module) =>
      Object.values(module).forEach((importFunction) => importFunction())
    );
    originalDefineCustomElements(...args);
  });
};

module.exports = exportModule;
