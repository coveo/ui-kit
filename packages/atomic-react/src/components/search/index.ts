export * from '../stencil-generated/search/components';
export * from '@coveo/headless';
export {Bindings, i18n} from '@coveo/atomic';

// Important: Re-exporting under the same name (eg: "AtomicSearchInterface") shadows the original component
// and should wrap it nicely for users of the library
export {SearchInterfaceWrapper as AtomicSearchInterface} from './SearchInterfaceWrapper';
export {ResultListWrapper as AtomicResultList} from './ResultListWrapper';
export {FoldedResultListWrapper as AtomicFoldedResultList} from './FoldedResultListWrapper';
export {SearchBoxInstantResultsWrapper as AtomicSearchBoxInstantResults} from './SearchBoxInstantResultsWrapper';
