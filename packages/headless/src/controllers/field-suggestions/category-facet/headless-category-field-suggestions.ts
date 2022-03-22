import {Subscribable} from '../../controller/headless-controller';
import {SearchEngine} from '../../../app/search-engine/search-engine';
import {CategoryFacetSearch} from '../../core/facets/facet-search/category/headless-category-facet-search';
import {
  buildCategoryFacet,
  CategoryFacetOptions,
} from '../../facets/category-facet/headless-category-facet';

/**
 * The `CategoryFieldSuggestions` controller provides query suggestions based on a particular category facet field.
 *
 * For example, you could use this controller to provide auto-completion suggestions while the end user is typing an item category.
 *
 * This controller is a wrapper around the basic category facet controller search functionality, and thus exposes similar options and properties.
 */
export interface CategoryFieldSuggestions
  extends CategoryFacetSearch,
    Subscribable {}

export interface CategoryFieldSuggestionsOptions extends CategoryFacetOptions {}

export interface CategoryFieldSuggestionsProps {
  /**
   * The options for the `CategoryFieldSuggestions` controller.
   * */
  options: CategoryFieldSuggestionsOptions;
}

/**
 * Creates a `CategoryFieldSuggestions` controller instance.
 * @param engine The headless engine.
 * @param props The configurable `CategoryFieldSuggestions` controller properties.
 * @returns A `CategoryFieldSuggestions` controller instance.
 */
export function buildCategoryFieldSuggestions(
  engine: SearchEngine,
  props: CategoryFieldSuggestionsProps
): CategoryFieldSuggestions {
  const categoryFacetController = buildCategoryFacet(engine, props);
  const {facetSearch, subscribe} = categoryFacetController;
  return {
    subscribe,
    ...facetSearch,
    updateText: function (text: string) {
      facetSearch.updateText(text);
      facetSearch.search();
    },
    get state() {
      return categoryFacetController.state.facetSearch;
    },
  };
}
