'use client';

import {useRouter} from 'next/navigation';
import {useEffect} from 'react';
import {useStandaloneSearchBox} from '@/lib/react/engine';
import SearchBoxCommon from '../common/search-box';

export default function StandaloneSearchBox() {
  const {state, methods} = useStandaloneSearchBox();
  const router = useRouter();

  useEffect(() => {
    if (state.redirectTo === '/react') {
      router.push(`/react?q=${encodeURIComponent(state.value)}`);
      methods?.afterRedirection();
    } else if (state.redirectTo) {
      // A redirection trigger of the query pipeline replaces the search page.
      window.location.assign(state.redirectTo);
    }
  }, [state.redirectTo, state.value, router, methods]);

  return <SearchBoxCommon value={state.value} methods={methods} />;
}
