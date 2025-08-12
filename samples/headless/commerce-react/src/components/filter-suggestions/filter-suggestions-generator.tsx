/**
 * This component relies on a headless controller and Commerce API feature that are not yet generally available.
 *
 * If you wish to implement filter suggestions in your project, please contact your Coveo representative.
 */
import type {
  CategoryFacetSearchResult,
  CategoryFilterSuggestions,
  FilterSuggestions as HeadlessFilterSuggestions,
  FilterSuggestionsGenerator as HeadlessFilterSuggestionsGenerator,
  RegularFacetSearchResult,
} from '@coveo/headless/commerce';
import {useEffect, useState} from 'react';
import FilterSuggestions from './filter-suggestions.js';

interface IFilterSuggestionsGeneratorProps {
  controller: HeadlessFilterSuggestionsGenerator;
  onClickFilterSuggestion: (
    controller: HeadlessFilterSuggestions | CategoryFilterSuggestions,
    value: RegularFacetSearchResult | CategoryFacetSearchResult
  ) => void;
}

export default function FilterSuggestionsGenerator(
  props: IFilterSuggestionsGeneratorProps
) {
  const {controller, onClickFilterSuggestion} = props;
  const [filterSuggestionsState, setFilterSuggestionsState] = useState(
    controller.filterSuggestions
  );

  useEffect(() => {
    controller.subscribe(() => {
      setFilterSuggestionsState(controller.filterSuggestions);
    });
  }, [controller]);

  if (filterSuggestionsState.length === 0) {
    return null;
  }

  return (
    <div className="FilterSuggestionsGenerator">
      {filterSuggestionsState.map((filterSuggestionsController) => {
        return (
          <FilterSuggestions
            key={filterSuggestionsController.state.facetId}
            controller={filterSuggestionsController}
            onClickFilterSuggestion={onClickFilterSuggestion}
          />
        );
      })}
    </div>
  );
}
