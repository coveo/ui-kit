import {fetchInitialState} from '@/src/common/engine';
import SearchPage from '@/src/components/search-page';

// Entry point SSR function
export default async function Search() {
  const initialState = await fetchInitialState();
  return <SearchPage initialState={initialState}></SearchPage>;
}
