import type {AutomaticFacet as HeadlessAutomaticFacet} from '@coveo/headless';
import {type FunctionComponent, useEffect, useState} from 'react';

interface AutomaticFacetProps {
  controller: HeadlessAutomaticFacet;
}

export const AutomaticFacet: FunctionComponent<AutomaticFacetProps> = (
  props
) => {
  const {controller} = props;
  const [state, setState] = useState(controller.state);

  useEffect(() => controller.subscribe(() => setState(controller.state)), []);

  return (
    <ul>
      {state.values.map((value) => (
        <li key={value.value}>
          <input
            type="checkbox"
            checked={value.state === 'selected'}
            onChange={() => controller.toggleSelect(value)}
          />
          {value.value} ({value.numberOfResults} results)
        </li>
      ))}
    </ul>
  );
};

// usage

/**
 * This component is meant to be used inside the `AutomaticFacetGenerator` component.
 */
