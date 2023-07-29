import {fetchInitialState} from '@/app/common/engine';
import SearchPage from './components/search-page';

// Entry point SSR function
export default async function Search() {
  const engineSnapshot = await fetchInitialState({controllers: {}});
  return <SearchPage engineSnapshot={engineSnapshot}></SearchPage>;
}
