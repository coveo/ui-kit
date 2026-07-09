'use client';

import type {
  RegularFacet as HeadlessRegularFacet,
  RegularFacetState,
  RegularFacetValue,
} from '@coveo/headless-react/ssr-commerce';
import {useEffect, useState} from 'react';

interface IRegularFacetProps {
  controller?: HeadlessRegularFacet;
  staticState: RegularFacetState;
}

export default function RegularFacet(props: IRegularFacetProps) {
  const {controller, staticState} = props;

  const [state, setState] = useState(staticState);

  useEffect(() => {
    controller?.subscribe(() => setState(controller.state));
  }, [controller]);

  const onChangeFacetValue = (value: RegularFacetValue): void => {
    controller?.toggleSelect(value);
  };

  return (
    <fieldset className="RegularFacet">
      <legend className="FacetHeader">
        <span className="FacetDisplayName">
          {state.displayName ?? state.facetId}
        </span>
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
        {state.values.map((value) => (
          <li className="FacetValue" key={value.value}>
            <input
              aria-label={`${value.state === 'idle' ? 'Select' : 'Deselect'} facet value '${value.value}'`}
              checked={value.state !== 'idle'}
              className="FacetValueCheckbox"
              disabled={!controller || state.isLoading}
              id={value.value}
              onChange={() => onChangeFacetValue(value)}
              type="checkbox"
            />
            <label className="FacetValueLabel" htmlFor={value.value}>
              <span className="FacetValueName">{value.value}</span>
              <span className="FacetValueCount">({value.numberOfResults})</span>
            </label>
          </li>
        ))}
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
