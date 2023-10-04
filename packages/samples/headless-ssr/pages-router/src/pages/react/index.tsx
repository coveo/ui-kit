import {SearchStaticState, fetchStaticState} from '@/src/lib/react/engine';
import SearchPageProvider from '@/src/lib/react/components/search-page';
import {CoveoNextJsSearchParametersSerializer} from '../../common/search-parameters-serializer';
import ResultList from '../../lib/react/components/result-list';
import SearchBox from '../../lib/react/components/search-box';
import SearchParameters from '../../lib/react/components/search-parameters';
import AuthorFacet from '../../lib/react/components/facets';

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
