import {Bindings} from './components/search/atomic-search-interface/atomic-search-interface';
import {initializeBindings as genericInitializeBindings} from './utils/initialization-utils';

export {Bindings} from './components/search/atomic-search-interface/atomic-search-interface';

export {Components, JSX} from './components';
export type {i18n} from 'i18next';

export {bindLogDocumentOpenOnResult} from './utils/result-utils';

export {MissingInterfaceParentError} from './utils/initialization-utils';

export {PopoverChildFacet} from './components/search/facets/atomic-popover/popover-type';

export function initializeBindings(element: Element) {
  return genericInitializeBindings<Bindings>(element);
}
export {resultContext} from './components/search/result-template-components/result-template-decorators';
export {
  dispatchSearchBoxSuggestionsEvent,
  SearchBoxSuggestionElement,
  SearchBoxSuggestions,
  SearchBoxSuggestionsBindings,
  SearchBoxSuggestionsEvent,
} from './components/search/search-box-suggestions/suggestions-common';
export {RedirectionPayload} from './components/search/atomic-search-box/redirection-payload';

export {RecsBindings} from './components/recommendations/atomic-recs-interface/atomic-recs-interface';
