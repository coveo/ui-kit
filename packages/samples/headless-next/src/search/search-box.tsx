'use client';

import {SearchBoxProps, buildSearchBox} from '@coveo/headless';
import {FunctionComponent} from 'react';
import {useClientSearchEngine} from '@/context/engine';
import {useController} from '@/hooks/use-controller';

export const SearchBox: FunctionComponent<{
  props?: SearchBoxProps;
}> = ({props}) => {
  const engine = useClientSearchEngine();
  const {state, methods} = useController(buildSearchBox, engine, props ?? {});

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        methods.submit();
      }}
    >
      <input
        defaultValue={state.value}
        onChange={(e) => methods.updateText(e.target.value)}
      />
      <button type="submit">Search</button>
    </form>
  );
};
