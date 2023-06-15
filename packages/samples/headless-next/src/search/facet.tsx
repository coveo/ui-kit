'use client';

import {FacetProps, buildFacet} from '@coveo/headless';
import {FunctionComponent} from 'react';
import {useClientSearchEngine} from '@/context/engine';
import {useController} from '@/hooks/use-controller';

export const Facet: FunctionComponent<{props: FacetProps}> = ({props}) => {
  const engine = useClientSearchEngine();
  const {state, methods} = useController(buildFacet, engine, props);

  if (!state.values.length) {
    return <div>No facet values</div>;
  }

  return (
    <ul>
      {state.values.map((value) => (
        <li key={value.value}>
          <input
            type="checkbox"
            checked={methods.isValueSelected(value)}
            onChange={() => methods.toggleSelect(value)}
            disabled={state.isLoading}
          />
          {value.value} ({value.numberOfResults} results)
        </li>
      ))}
    </ul>
  );
};
