import {SearchStaticState, fetchStaticState} from '@/common/lib/react/engine';
import {SearchPageProvider} from '@/common/components/react/search-page';
import {CoveoNextJsSearchParametersSerializer} from '@/common/components/common/search-parameters-serializer';
import ResultList from '@/common/components/react/result-list';
import SearchBox from '@/common/components/react/search-box';
import SearchParameters from '@/common/components/react/search-parameters';
import {AuthorFacet} from '@/common/components/react/facets';

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
