import type {
  RegularFacet as HeadlessRegularFacet,
  RegularFacetValue,
} from '@coveo/headless/commerce';
import {useEffect, useState} from 'react';

interface IRegularFacetProps {
  controller: HeadlessRegularFacet;
}

/**
 * A simple checkbox facet: the values and a Clear button. Facet search and
 * show more/less are intentionally omitted to keep the sample focused.
 */
export default function RegularFacet(props: IRegularFacetProps) {
  const {controller} = props;

  const [state, setState] = useState(controller.state);

  useEffect(() => {
    controller.subscribe(() => setState(controller.state));
  }, [controller]);

  const onClickFacetValue = (facetValue: RegularFacetValue): void => {
    controller.toggleSelect(facetValue);
  };

  return (
    <fieldset className="RegularFacet">
      <legend className="FacetDisplayName">{state.displayName ?? state.facetId}</legend>
      <ul className="FacetValues">
        {state.values.map((value) => {
          const id = `${state.facetId}-${value.value}-facet-value`;
          return (
            <li className="FacetValue" key={id}>
              <input
                aria-label={`${value.state === 'idle' ? 'Select' : 'Deselect'} facet value '${value.value}'`}
                className="FacetValueCheckbox"
                disabled={state.isLoading}
                id={id}
                checked={value.state !== 'idle'}
                onChange={() => onClickFacetValue(value)}
                type="checkbox"
              ></input>
              <label className="FacetValueLabel" htmlFor={id}>
                <span className="FacetValueName">{value.value}</span>
                <span className="FacetValueNumberOfProducts"> ({value.numberOfResults})</span>
              </label>
            </li>
          );
        })}
      </ul>
      {state.hasActiveValues && (
        <button
          type="reset"
          aria-label="Clear selected facet values"
          className="FacetClearSelected"
          onClick={() => controller.deselectAll()}
        >
          Clear
        </button>
      )}
    </fieldset>
  );
}
