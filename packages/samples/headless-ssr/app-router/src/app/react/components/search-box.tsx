'use client';

import SearchBoxCommon from '../../../common/search-box';
import {useSearchBox} from '../common/engine';

export default function SearchBox() {
  const {state, methods} = useSearchBox();

  return <SearchBoxCommon controller={methods} value={state.value} />;
}
