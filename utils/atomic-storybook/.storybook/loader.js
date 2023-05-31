const stencil = require('@stencil/core/compiler');

module.exports = function (source) {
  const callback = this.async();
  const compiled = stencil.transpileSync(source);
  callback(null, compiled.code);
};
