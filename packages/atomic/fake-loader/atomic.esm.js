import {
  atomicVersion,
  defineCustomElements,
  headlessVersion,
} from './loader.js';

export {atomicVersion, headlessVersion};

window.CoveoAtomic = {version: atomicVersion, headlessVersion: headlessVersion};
defineCustomElements();
