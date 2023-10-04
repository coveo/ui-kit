import {
  SearchBoxState,
  SearchBox as SearchBoxController,
} from '@coveo/headless/ssr';
import {useEffect, useState} from 'react';
import SearchBoxCommon from '../../../common/search-box';

interface SearchBoxProps {
  staticState: SearchBoxState;
  controller?: SearchBoxController;
}

export default function SearchBox({staticState, controller}: SearchBoxProps) {
  const [state, setState] = useState(staticState);

  useEffect(
    () => controller?.subscribe?.(() => setState({...controller.state})),
    [controller]
  );

  return <SearchBoxCommon controller={controller} value={state.value} />;
}
