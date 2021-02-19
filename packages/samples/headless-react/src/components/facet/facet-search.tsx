import {
  FacetSearch as HeadlessFacetSearch,
  FacetSearchState,
  SpecificFacetSearchResult,
} from '@coveo/headless';
import {FunctionComponent} from 'react';

export interface FacetSearchProps {
  controller: HeadlessFacetSearch;
  facetState: FacetSearchState;
  isValueSelected: (facetSearchValue: SpecificFacetSearchResult) => boolean;
}

export const FacetSearch: FunctionComponent<FacetSearchProps> = (props) => {
  const onInput = (text: string) => {
    props.controller.updateText(text);
    props.controller.search();
  };

  return (
    <div>
      <input onInput={(e) => onInput(e.currentTarget.value)} />
      <ul>
        {props.facetState.values.map((facetSearchValue) => (
          <li key={facetSearchValue.rawValue}>
            <button
              onClick={() => props.controller.select(facetSearchValue)}
              disabled={props.isValueSelected(facetSearchValue)}
            >
              {facetSearchValue.displayValue} ({facetSearchValue.count} results)
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
