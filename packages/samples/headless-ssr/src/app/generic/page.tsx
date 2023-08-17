import {fetchInitialState} from '@/src/app/generic/common/engine';
import SearchPage from '@/src/app/generic/components/search-page';

// Entry point SSR function
export default async function Search() {
  const ssrState = await fetchInitialState();
  return <SearchPage ssrState={ssrState}></SearchPage>;
}
