export * from '@coveo/atomic-legacy/item-decorators';
export type {i18n} from 'i18next';

import * as _Components from './components/index.js';
export {_Components as Components, _Components as JSX};
export {CommerceBindings} from './components/commerce/atomic-commerce-interface/atomic-commerce-interface';
export {SelectChildProductEventArgs} from './components/commerce/atomic-product-children/select-child-product-event';
export {fetchProductContext} from './components/commerce/product-template-component-utils/context/fetch-product-context';
export {PopoverChildFacet} from './components/common/facets/popover/popover-type';
export {RedirectionPayload} from './components/common/search-box/redirection-payload';
export {dispatchSearchBoxSuggestionsEvent} from './components/common/suggestions/suggestions-events';
export type {
  SearchBoxSuggestionElement,
  SearchBoxSuggestions,
  SearchBoxSuggestionsBindings,
  SearchBoxSuggestionsEvent,
} from './components/common/suggestions/suggestions-types';
export {
  elementHasNoQuery,
  elementHasQuery,
} from './components/common/suggestions/suggestions-utils';
export {RecsBindings} from './components/recommendations/atomic-recs-interface/atomic-recs-interface';
export {Bindings} from './components/search/atomic-search-interface/atomic-search-interface';
export {
  fetchBindings as initializeBindings,
  MissingInterfaceParentError,
} from './utils/initialization-common-utils';
export {bindLogDocumentOpenOnResult} from './utils/result-utils';
