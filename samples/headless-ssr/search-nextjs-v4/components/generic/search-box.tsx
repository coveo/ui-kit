'use client';

import type {SearchBox as SearchBoxController, SearchBoxState} from '@coveo/headless/ssr-next';
import SearchBoxCommon from '../common/search-box';
import {useControllerState} from './use-controller-state';

interface SearchBoxProps {
  staticState: SearchBoxState;
  controller?: SearchBoxController;
}

export default function SearchBox({staticState, controller}: SearchBoxProps) {
  const state = useControllerState(staticState, controller);

  return <SearchBoxCommon value={state.value} methods={controller} />;
}
