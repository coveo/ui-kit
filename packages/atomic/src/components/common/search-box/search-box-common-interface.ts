import {QuerySetActionCreators} from '@coveo/headless';
import {InsightBindings} from '../../insight/atomic-insight-interface/atomic-insight-interface';
import {Bindings} from '../../search/atomic-search-interface/atomic-search-interface';
import {SearchBoxSuggestionElement} from '../../search/search-box-suggestions/suggestions-common';

export interface SearchBoxCommonProps {
  id: string;
  disableSearch: Boolean;
  bindings: InsightBindings | Bindings;
  querySetActions: QuerySetActionCreators;
  focusValue: (value: HTMLElement) => void;
  clearSuggestions: () => void;
  getIsExpanded: () => boolean;
  getPanelInFocus: () => HTMLElement | undefined;
  getActiveDescendant: () => string;
  getActiveDescendantElement: () => HTMLElement | null;
  getAllSuggestionElements: () => SearchBoxSuggestionElement[];
}
