import {
  SearchBoxState,
  SearchBox as SearchBoxController,
} from '@coveo/headless';
import {useEffect, useState, FunctionComponent} from 'react';
import SearchBoxCommon from '../../common/search-box';

interface SearchBoxProps {
  ssrState: SearchBoxState;
  controller?: SearchBoxController;
}

export const SearchBox: FunctionComponent<SearchBoxProps> = ({
  ssrState,
  controller,
}: SearchBoxProps) => {
  const [state, setState] = useState(ssrState);

  useEffect(
    () => controller?.subscribe?.(() => setState({...controller.state})),
    [controller]
  );

  return <SearchBoxCommon controller={controller} value={state.value} />;
};
