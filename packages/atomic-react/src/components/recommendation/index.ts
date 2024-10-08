export * from '../stencil-generated/search/index.js';
export {RecsBindings, i18n} from '@coveo/atomic';

// Important: Re-exporting under the same name (eg: "AtomicRecsInterface") shadows the original component
// and should wrap it nicely for users of the library
export {RecsInterfaceWrapper as AtomicRecsInterface} from './RecsInterfaceWrapper.js';
export {RecsListWrapper as AtomicRecsList} from './RecsListWrapper.js';
