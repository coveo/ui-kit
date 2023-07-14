'use client';

import {FunctionComponent} from 'react';
import {useSearchBox} from '@/common/engine-definition.client';

export const SearchBox: FunctionComponent = () => {
  const {state, methods} = useSearchBox();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        methods?.submit();
      }}
    >
      <input
        defaultValue={state.value}
        onChange={(e) => methods?.updateText(e.target.value)}
      />
      <button type="submit">Search</button>
    </form>
  );
};
