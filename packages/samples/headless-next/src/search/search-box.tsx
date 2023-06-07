import {SearchBoxProps, SearchBoxState} from '@coveo/headless';
import {FunctionComponent, Suspense} from 'react';
import {InteractiveSearchBox} from './search-box.client';
import {StaticSearchBox} from './search-box.common';

export const SearchBox: FunctionComponent<{
  initialState: SearchBoxState;
  props?: SearchBoxProps;
}> = ({initialState, props}) => (
  <Suspense fallback={<StaticSearchBox state={initialState} />}>
    <InteractiveSearchBox props={props} />
  </Suspense>
);
