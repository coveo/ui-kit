'use client';

import {useClientSearchEngine} from '@/context/engine';
import {useController} from '@/hooks/use-controller';
import {SearchBoxProps, buildSearchBox} from '@coveo/headless';
import {FunctionComponent} from 'react';
import {StaticSearchBox} from './search-box.common';

export const InteractiveSearchBox: FunctionComponent<{
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
      <StaticSearchBox
        state={state}
        onChange={(value) => methods.updateText(value)}
      />
    </form>
  );
};
