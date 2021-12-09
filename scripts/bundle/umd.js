function umdWrapper(globalName) {
  const header = `(function (global, factory) {
    const isCommonjs = typeof exports === 'object' && typeof module !== 'undefined';
    
    if (isCommonjs) {
      return factory(exports);
    }
    
    const isAmd = typeof define === 'function' && define.amd;

    if (isAmd) {
      return define(['exports'], factory);
    }

    global = typeof globalThis !== 'undefined' ? globalThis : global || self;
    factory(global.${globalName} = {});
  })(this, (function (exports) { 'use strict';`;
  const footer = `}));`;

  return {header, footer};
}

module.exports = {umdWrapper};
