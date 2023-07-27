import {fetchInitialState} from '@/app/common/engine';
import SearchPage from './components/search-page';

export default async function Search() {
  // TODO Debug: Size keeps changing non-trivially with page refresh
  const engineSnapshot = await fetchInitialState({controllers: {}});
  return <SearchPage engineSnapshot={engineSnapshot}></SearchPage>;
}
