import {SearchEngine} from '../../../app/search-engine/search-engine';
import {FacetSearch} from '../../core/facets/facet-search/specific/headless-facet-search';
import {buildFacet} from '../../facets/facet/headless-facet';
import {FacetOptions} from '../../facets/facet/headless-facet-options';
import {Subscribable} from '../../controller/headless-controller';

/**
 * The `FieldSuggestions` controller is responsible to provide query suggestions based on a particular facet field.
 *
 * For example, you could use this controller to provide auto-complete suggestions while the end user is typing the title of an item.
 *
 * This controller is a wrapper around the basic facet controller search functionnality, and thus expose similar options and properties.
 */
export interface FieldSuggestions extends FacetSearch, Subscribable {}

export interface FieldSuggestionsOptions extends FacetOptions {}

export interface FieldSuggestionsProps {
  /**
   * The options for the `FieldSuggestions` controller.
   * */
  options: FieldSuggestionsOptions;
}

/**
 * Creates a `FieldSuggestions` controller instance.
 * @param engine The headless engine.
 * @param props The configurable `FieldSuggestions` controller properties.
 * @returns A `FieldSuggestions` controller instance.
 */
export function buildFieldSuggestions(
  engine: SearchEngine,
  props: FieldSuggestionsProps
): FieldSuggestions {
  const facetController = buildFacet(engine, props);
  const {facetSearch, subscribe} = facetController;
  return {
    subscribe,
    ...facetSearch,
    updateText: function (text: string) {
      facetSearch.updateText(text);
      facetSearch.search();
    },
    get state() {
      return facetController.state.facetSearch;
    },
  };
}
