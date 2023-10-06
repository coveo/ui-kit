'use client';

import SearchBoxCommon from '../common/search-box';
import {useSearchBox} from '../../lib/react/engine';

export default function SearchBox() {
  const {state, methods} = useSearchBox();

  return <SearchBoxCommon controller={methods} value={state.value} />;
}
