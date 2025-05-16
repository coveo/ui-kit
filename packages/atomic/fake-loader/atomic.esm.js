import {defineCustomElements, atomicVersion, headlessVersion} from './index.js';

window.CoveoAtomic = {version: atomicVersion, headlessVersion: headlessVersion};

defineCustomElements();
