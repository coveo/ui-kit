import {SearchStaticState, fetchStaticState} from '@/src/lib/react/engine';
import SearchPageProvider from '@/src/components/react/search-page';
import {CoveoNextJsSearchParametersSerializer} from '../../components/common/search-parameters-serializer';
import ResultList from '../../components/react/result-list';
import SearchBox from '../../components/react/search-box';
import SearchParameters from '../../components/react/search-parameters';
import AuthorFacet from '../../components/react/facets';

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
