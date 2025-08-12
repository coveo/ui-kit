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

  const renderFacetValues = () => {
    return (
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
              ></input>
              <label className="FacetValueLabel" htmlFor={id}>
                <span className="FacetValueName">
                  {value.start} to {value.end}
                </span>
                <span className="FacetValueNumberOfResults">
                  {' '}
                  ({value.numberOfResults})
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <fieldset className="DateFacet">
      <legend className="FacetDisplayName">
        {state.displayName ?? state.facetId}
      </legend>
      <button
        type="button"
        className="FacetClear"
        disabled={!controller || !state.hasActiveValues}
        onClick={controller?.deselectAll}
      >
        X
      </button>
      {state.isLoading && (
        <span className="FacetLoading"> Facet is loading...</span>
      )}
      {renderFacetValues()}
      <button
        type="button"
        className="FacetShowMore"
        disabled={!controller || !state.canShowMoreValues}
        onClick={controller?.showMoreValues}
      >
        +
      </button>
      <button
        type="button"
        className="FacetShowLess"
        disabled={!controller || !state.canShowLessValues}
        onClick={controller?.showLessValues}
      >
        -
      </button>
    </fieldset>
  );
}
