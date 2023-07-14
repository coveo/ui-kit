'use client';

import {FacetState} from '@coveo/headless';
import {FunctionComponent} from 'react';
import {useAuthorFacet} from '@/common/engine-definition.client';
import {FacetMethods} from '@/utils/ssr-headless';

export const AuthorFacet: FunctionComponent = () => {
  const {state, methods} = useAuthorFacet();

  return <BaseFacet state={state} methods={methods} />;
};

const BaseFacet: FunctionComponent<{
  state: FacetState;
  methods?: FacetMethods;
}> = ({state, methods}) => {
  if (!state.values.length) {
    return <div>No facet values</div>;
  }

  return (
    <ul>
      {state.values.map((value) => (
        <li key={value.value}>
          <input
            type="checkbox"
            checked={value.state === 'selected'}
            onChange={() => methods?.toggleSelect(value)}
            disabled={state.isLoading}
          />
          {value.value} ({value.numberOfResults} results)
        </li>
      ))}
    </ul>
  );
};
