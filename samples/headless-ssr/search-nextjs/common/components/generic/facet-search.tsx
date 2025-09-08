import type {Facet as FacetController, FacetState} from '@coveo/headless/ssr';
import {type FunctionComponent, useEffect, useState} from 'react';

interface FacetSearchProps {
  staticState: FacetState;
  controller?: FacetController;
}

export const FacetSearch: FunctionComponent<FacetSearchProps> = ({
  staticState,
  controller,
}) => {
  const [state, setState] = useState(staticState);

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
              type="button"
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
