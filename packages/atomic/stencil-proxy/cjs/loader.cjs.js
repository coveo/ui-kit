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
const exportModule = {};
exportModule.defineCustomElements = (...args) => {
  allComponents.then((module) =>
    Object.values(module).forEach((importFunction) => importFunction())
  );
};
exportModule.applyPolyfills = () => {
  throw new Error('The applyPolyfills function has been removed. It has always been a no-op and should not be used.');
};
exportModule.setNonce = () => {
  console.warn('Since v3.52.0, `@coveo/atomic` no longer adds script or style tags. The setNonce function is now a no-op and can be safely removed from your codebase.');
};
Object.assign(exportModule, require('./version.cjs.js'));
module.exports = exportModule;
