export {i18n, RecsBindings} from '@coveo/atomic';
export * from '../search/components.js';
export * from '../stencil-generated/search/index.js';

// Important: Re-exporting under the same name (eg: "AtomicRecsInterface") shadows the original component
// and should wrap it nicely for users of the library
export {RecsInterfaceWrapper as AtomicRecsInterface} from './RecsInterfaceWrapper.js';
export {RecsListWrapper as AtomicRecsList} from './RecsListWrapper.js';
