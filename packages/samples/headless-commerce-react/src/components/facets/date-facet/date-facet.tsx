import {DateFacet as HeadlessDateFacet} from '@coveo/headless/commerce';
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
        {state.values.map((value, index) => (
          <li className="FacetValue" key={index}>
            <input
              className="FacetValueCheckbox"
              type="checkbox"
              checked={value.state !== 'idle'}
              onChange={() => controller.toggleSelect(value)}
            ></input>
            <label className="FacetValueLabel">
              {value.start} to {value.end}
            </label>
            <span className="FacetValueNumberOfResults">
              {' '}
              ({value.numberOfResults})
            </span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <li className="DateFacet">
      <h3 className="FacetDisplayName">{state.displayName ?? state.facetId}</h3>
      <button
        className="FacetClear"
        disabled={!state.hasActiveValues}
        onClick={controller.deselectAll}
      >
        Clear
      </button>
      {renderFacetValues()}
      <button
        className="FacetShowMore"
        disabled={!state.canShowMoreValues}
        onClick={controller.showMoreValues}
      >
        Show more
      </button>
      <button
        className="FacetShowLess"
        disabled={!state.canShowLessValues}
        onClick={controller.showLessValues}
      >
        Show less
      </button>
    </li>
  );
}
