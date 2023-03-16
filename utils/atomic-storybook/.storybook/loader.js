const stencil = require('@stencil/core/compiler');

/** @type {import('webpack').LoaderDefinition} */
module.exports = function (source) {
  const callback = this.async();
  stencil
    .transpile(source)
    .then(({code}) => callback(null, code))
    .catch((e) => callback(e));
};
