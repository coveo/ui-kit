function umdWrapper(globalName) {
  const header = `(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.${globalName} = {}));
  })(this, (function (exports) { 'use strict';`;
  const footer = `}));`;

  return {header, footer};
}

module.exports = {umdWrapper};
