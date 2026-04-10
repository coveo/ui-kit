import {defineCustomElements} from './loader.js';
import {atomicVersion, headlessVersion} from './versions.js';

export {atomicVersion, headlessVersion};

window.CoveoAtomic = {version: atomicVersion, headlessVersion: headlessVersion};
defineCustomElements();
