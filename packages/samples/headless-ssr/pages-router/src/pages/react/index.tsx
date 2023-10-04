import {
  SearchStaticState,
  fetchStaticState,
} from '@/src/pages/react/common/engine';
import {SearchPageProvider} from '@/src/pages/react/components/search-page';
import {CoveoNextJsSearchParametersSerializer} from '../../common/search-parameters-serializer';
import ResultList from './components/result-list';
import SearchBox from './components/search-box';
import SearchParameters from './components/search-parameters';
import {AuthorFacet} from './components/facets';

export async function getServerSideProps() {
  const {coveoSearchParameters} =
    CoveoNextJsSearchParametersSerializer.fromServerSideUrlSearchParams({
      '': '',
    });
  const staticState = await fetchStaticState({
    controllers: {
      searchParameters: {initialState: {parameters: coveoSearchParameters}},
    },
  });
  return {props: {staticState}};
}

interface StaticStateProps {
  staticState: SearchStaticState;
}

// Entry point SSR function
export default function Search({staticState}: StaticStateProps) {
  return (
    <SearchPageProvider staticState={staticState}>
      <SearchParameters />
      <SearchBox />
      <ResultList />
      <AuthorFacet />
    </SearchPageProvider>
  );
}
