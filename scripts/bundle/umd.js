function umdFooter(globalName) {
  const footer = `(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
      define(factory);
    } else if (typeof module === 'object' && module.exports) {
      module.exports = factory();
    } else {
      root.${globalName} = factory();
    }
  }(typeof self !== 'undefined' ? self : this, () => ${globalName}));`;

  return footer;
}

module.exports = {umdFooter};
