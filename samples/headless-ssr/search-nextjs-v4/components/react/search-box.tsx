'use client';

import {useSearchBox} from '@/lib/react/engine';
import SearchBoxCommon from '../common/search-box';

export default function SearchBox() {
  const {state, methods} = useSearchBox();

  return <SearchBoxCommon value={state.value} methods={methods} />;
}
