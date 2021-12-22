export * from './stencil-generated/index';
export * from '@coveo/atomic/headless';

// Important: Re-exporting under the same name "AtomicSearchInterface" shadows the original component
// and should wrap it nicely for users of the library
export {AtomicSearchInterfaceWrapper as AtomicSearchInterface} from './SearchInterfaceWrapper';
