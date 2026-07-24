'use client';

import type {
  NumericFacet as HeadlessNumericFacet,
  NumericFacetState,
} from '@coveo/headless-react/ssr-commerce';
import {useEffect, useState} from 'react';

interface INumericFacetProps {
  controller?: HeadlessNumericFacet;
  staticState: NumericFacetState;
}

export default function NumericFacet(props: INumericFacetProps) {
  const {controller, staticState} = props;

  const [state, setState] = useState(staticState);

  useEffect(() => {
    controller?.subscribe(() => setState(controller.state));
  }, [controller]);

  return (
    <fieldset className="NumericFacet">
      <legend className="FacetHeader">
        <span className="FacetDisplayName">{state.displayName ?? state.facetId}</span>
        <button
          type="button"
          className="FacetClear"
          aria-label={`Clear ${state.displayName ?? state.facetId} filter`}
          disabled={!controller || !state.hasActiveValues}
          onClick={() => controller?.deselectAll()}
        >
          Clear
        </button>
      </legend>

      <ul className="FacetValues">
        {state.values.map((value) => {
          const id = `${value.start}-${value.end}-${value.endInclusive}`;
          return (
            <li className="FacetValue" key={id}>
              <input
                checked={value.state !== 'idle'}
                className="FacetValueCheckbox"
                disabled={!controller}
                id={id}
                onChange={() => controller?.toggleSelect(value)}
                type="checkbox"
              />
              <label className="FacetValueLabel" htmlFor={id}>
                <span className="FacetValueName">
                  {Math.round(value.start * 100) / 100} to {Math.round(value.end * 100) / 100}
                </span>
                <span className="FacetValueCount">({value.numberOfResults})</span>
              </label>
            </li>
          );
        })}
      </ul>

      <div className="FacetControls">
        <button
          type="button"
          aria-label="Show more facet values"
          className="FacetShowMore"
          disabled={!controller || state.isLoading || !state.canShowMoreValues}
          onClick={() => controller?.showMoreValues()}
        >
          Show more
        </button>
        <button
          type="button"
          aria-label="Show less facet values"
          className="FacetShowLess"
          disabled={!controller || state.isLoading || !state.canShowLessValues}
          onClick={() => controller?.showLessValues()}
        >
          Show less
        </button>
      </div>
    </fieldset>
  );
}
