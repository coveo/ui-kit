export * from '../stencil-generated/search/index.js';
export {Bindings, i18n} from '@coveo/atomic';

// Important: Re-exporting under the same name (eg: "AtomicSearchInterface") shadows the original component
// and should wrap it nicely for users of the library
export {SearchInterfaceWrapper as AtomicSearchInterface} from './SearchInterfaceWrapper.js';
export {ResultListWrapper as AtomicResultList} from './ResultListWrapper.js';
export {FoldedResultListWrapper as AtomicFoldedResultList} from './FoldedResultListWrapper.js';
export {SearchBoxInstantResultsWrapper as AtomicSearchBoxInstantResults} from './SearchBoxInstantResultsWrapper.js';
