'use client';

import type {
  DateFacetState,
  DateFacet as HeadlessDateFacet,
} from '@coveo/headless-react/ssr-commerce';
import {useEffect, useState} from 'react';

interface IDateFacetProps {
  controller?: HeadlessDateFacet;
  staticState: DateFacetState;
}

export default function DateFacet(props: IDateFacetProps) {
  const {controller, staticState} = props;

  const [state, setState] = useState(staticState);

  useEffect(() => {
    controller?.subscribe(() => setState(controller.state));
  }, [controller]);

  return (
    <fieldset className="DateFacet">
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
                  {value.start} to {value.end}
                </span>
                <span className="FacetValueCount">
                  ({value.numberOfResults})
                </span>
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
          disabled={!controller || !state.canShowMoreValues}
          onClick={() => controller?.showMoreValues()}
        >
          Show more
        </button>
        <button
          type="button"
          aria-label="Show less facet values"
          className="FacetShowLess"
          disabled={!controller || !state.canShowLessValues}
          onClick={() => controller?.showLessValues()}
        >
          Show less
        </button>
      </div>
    </fieldset>
  );
}
