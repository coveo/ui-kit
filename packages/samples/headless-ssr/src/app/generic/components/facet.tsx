import {FacetState, Facet as FacetController} from '@coveo/headless';
import {useEffect, useState, FunctionComponent} from 'react';
import {FacetSearch} from './facet-search';

interface FacetProps {
  title: string;
  ssrState: FacetState;
  controller?: FacetController;
}

export const Facet: FunctionComponent<FacetProps> = ({
  title,
  ssrState,
  controller,
}) => {
  const [state, setState] = useState(ssrState);

  useEffect(
    () => controller?.subscribe?.(() => setState({...controller.state})),
    [controller]
  );

  return (
    <fieldset>
      <legend>{title} facet</legend>
      <FacetSearch ssrState={ssrState} controller={controller} />
      <ul>
        {state.values.map((value) => (
          <li key={value.value}>
            <input
              type="checkbox"
              checked={value.state === 'selected'}
              onChange={() => controller?.toggleSelect(value)}
              disabled={state.isLoading}
            />
            {value.value} ({value.numberOfResults} results)
          </li>
        ))}
      </ul>
    </fieldset>
  );
};
