export * from './stencil-generated/index';
export * from '@coveo/atomic/headless';

// Important: Re-exporting under the same name (eg: "AtomicSearchInterface") shadows the original component
// and should wrap it nicely for users of the library
export {SearchInterfaceWrapper as AtomicSearchInterface} from './SearchInterfaceWrapper';
export {ResultListWrapper as AtomicResultList} from './ResultListWrapper';
export {FoldedResultListWrapper as AtomicFoldedResultList} from './FoldedResultListWrapper';
