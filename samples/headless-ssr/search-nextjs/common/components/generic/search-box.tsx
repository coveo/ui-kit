import type {
  SearchBox as SearchBoxController,
  SearchBoxState,
} from '@coveo/headless/ssr';
import {type FunctionComponent, useEffect, useState} from 'react';
import SearchBoxCommon from '../common/search-box';

interface SearchBoxProps {
  staticState: SearchBoxState;
  controller?: SearchBoxController;
}

export const SearchBox: FunctionComponent<SearchBoxProps> = ({
  staticState,
  controller,
}: SearchBoxProps) => {
  const [state, setState] = useState(staticState);

  useEffect(
    () => controller?.subscribe?.(() => setState({...controller.state})),
    [controller]
  );

  return <SearchBoxCommon controller={controller} value={state.value} />;
};
