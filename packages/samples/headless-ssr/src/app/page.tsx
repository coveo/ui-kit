import {fetchInitialState} from '@/src/common/engine';
import SearchPage from '@/src/components/search-page';
import {Suspense} from 'react';

// Entry point SSR function
export default async function Search() {
  const engineSnapshot = await fetchInitialState({controllers: {}});
  return (
    <Suspense fallback={<div>Hydrating engine ..</div>}>
      <SearchPage engineSnapshot={engineSnapshot}></SearchPage>
    </Suspense>
  );
}
