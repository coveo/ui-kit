import {
  SearchBoxState,
  SearchBox as SearchBoxController,
} from '@coveo/headless';
import {useEffect, useState, FunctionComponent} from 'react';
import SearchBoxCommon from '../../common/search-box';

interface SearchBoxProps {
  initialState: SearchBoxState;
  controller?: SearchBoxController;
}

export const SearchBox: FunctionComponent<SearchBoxProps> = ({
  initialState,
  controller,
}: SearchBoxProps) => {
  const [state, setState] = useState(initialState);

  useEffect(
    () => controller?.subscribe?.(() => setState({...controller.state})),
    [controller]
  );

  return <SearchBoxCommon controller={controller} value={state.value} />;
};
