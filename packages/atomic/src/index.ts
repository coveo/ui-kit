export {Components, JSX} from './components';
export type {i18n} from 'i18next';

export {bindLogDocumentOpenOnResult} from './utils/result-utils';

export {
  initializeBindings,
  Bindings,
  MissingInterfaceParentError,
} from './utils/initialization-utils';

export {resultContext} from './components/search/result-template-components/result-template-decorators';
export {
  dispatchSearchBoxSuggestionsEvent,
  SearchBoxSuggestionElement,
  SearchBoxSuggestions,
  SearchBoxSuggestionsBindings,
  SearchBoxSuggestionsEvent,
} from './components/search/search-box-suggestions/suggestions-common';
