import {fetchInitialState} from '@/src/app/react/common/engine';
import SearchPage from '@/src/app/react/components/search-page';

// Entry point SSR function
export default async function Search() {
  const ssrState = await fetchInitialState();
  return <SearchPage ssrState={ssrState}></SearchPage>;
}
