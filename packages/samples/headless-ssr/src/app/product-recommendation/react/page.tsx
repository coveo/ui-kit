import {fetchStaticState} from './common/engine';
import {PopularBoughtRecommendations} from './components/recommendations';
import {SearchPageProvider} from './components/search-page';

// Entry point SSR function
export default async function Search() {
  const staticState = await fetchStaticState();

  return (
    <SearchPageProvider staticState={staticState}>
      <PopularBoughtRecommendations />
    </SearchPageProvider>
  );
}

// A page with search parameters cannot be statically rendered, since its rendered state should look different based on the current search parameters.
export const dynamic = 'force-dynamic';
