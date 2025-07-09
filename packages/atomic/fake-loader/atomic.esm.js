import {atomicVersion, defineCustomElements, headlessVersion} from './index.js';

export {atomicVersion, headlessVersion};

window.CoveoAtomic = {version: atomicVersion, headlessVersion: headlessVersion};
defineCustomElements();
