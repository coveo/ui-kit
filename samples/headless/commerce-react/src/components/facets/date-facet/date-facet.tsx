import type {DateFacet as HeadlessDateFacet} from '@coveo/headless/commerce';
import {useEffect, useState} from 'react';

interface IDateFacetProps {
  controller: HeadlessDateFacet;
}

export default function DateFacet(props: IDateFacetProps) {
  const {controller} = props;

  const [state, setState] = useState(controller.state);

  useEffect(() => {
    controller.subscribe(() => setState(controller.state));
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
                disabled={state.isLoading}
                id={id}
                onChange={() => controller.toggleSelect(value)}
                type="checkbox"
              ></input>
              <label className="FacetValueLabel" htmlFor={id}>
                {value.start} to {value.end}
              </label>
              <span className="FacetValueNumberOfResults">
                {' '}
                ({value.numberOfResults})
              </span>
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
        aria-label="Clear selected facet values"
        className="FacetClear"
        disabled={state.isLoading || !state.hasActiveValues}
        onClick={controller.deselectAll}
      >
        X
      </button>
      {state.isLoading && (
        <span className="FacetLoading"> Facet is loading...</span>
      )}
      {renderFacetValues()}
      <button
        type="button"
        aria-label="Show more facet values"
        className="FacetShowMore"
        disabled={state.isLoading || !state.canShowMoreValues}
        onClick={controller.showMoreValues}
      >
        +
      </button>
      <button
        type="button"
        aria-label="Show less facet values"
        className="FacetShowLess"
        disabled={state.isLoading || !state.canShowLessValues}
        onClick={controller.showLessValues}
      >
        -
      </button>
    </fieldset>
  );
}
