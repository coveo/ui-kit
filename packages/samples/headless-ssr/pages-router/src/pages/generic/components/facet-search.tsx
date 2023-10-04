import {FacetState, Facet as FacetController} from '@coveo/headless/ssr';
import {useEffect, useState} from 'react';

interface FacetSearchProps {
  staticState: FacetState;
  controller?: FacetController;
}

export default function FacetSearch({
  staticState,
  controller,
}: FacetSearchProps) {
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
}
