import {
  FacetState,
  Facet as FacetController,
  Controller,
} from '@coveo/headless';
import {FunctionComponent, useEffect, useState} from 'react';

interface FacetSearchProps {
  ssrState: FacetState;
  controller?: FacetController;
}

export const FacetSearch: FunctionComponent<FacetSearchProps> = ({
  ssrState,
  controller,
}) => {
  const [state, setState] = useState(ssrState);

  useEffect(
    () => controller?.subscribe?.(() => setState({...controller.state})),
    [controller]
  );

  return (
    <>
      <input
        onInput={
          controller &&
          ((e) => {
            controller.facetSearch.updateText(e.currentTarget.value);
            controller.facetSearch.search();
          })
        }
      />
      <ul>
        {state.facetSearch.values.map((facetSearchValue) => (
          <li key={facetSearchValue.rawValue}>
            <button
              onClick={() => controller?.facetSearch.select(facetSearchValue)}
              disabled={state.values.some(
                (value) =>
                  value.state === 'selected' &&
                  value.value === facetSearchValue.rawValue
              )}
            >
              {facetSearchValue.displayValue} ({facetSearchValue.count} results)
            </button>
          </li>
        ))}
      </ul>
    </>
  );
};
