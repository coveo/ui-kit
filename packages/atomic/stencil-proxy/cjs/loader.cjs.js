const exportModule = require('./_loader.cjs.js');
const searchComponents = import(
  '../atomic/components/components/search/lazy-index.js'
);
const commerceComponents = import(
  '../atomic/components/components/commerce/lazy-index.js'
);
const commonComponents = import(
  '../atomic/components/components/common/lazy-index.js'
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
  commonComponents,
  searchComponents,
  commerceComponents,
  insightComponents,
  ipxComponents,
  recommendationsComponents,
]);

const originalDefineCustomElements = exportModule.defineCustomElements;
exportModule.defineCustomElements = (...args) => {
  allComponents.then((module) =>
    Object.values(module).forEach((importFunction) => importFunction())
  );
  originalDefineCustomElements(...args);
};
Object.assign(exportModule, require('./version.cjs.js'));
module.exports = exportModule;
