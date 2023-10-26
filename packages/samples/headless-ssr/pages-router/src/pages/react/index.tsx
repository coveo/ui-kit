import {AuthorFacet} from '@/common/components/react/facets';
import ResultList from '@/common/components/react/result-list';
import SearchBox from '@/common/components/react/search-box';
import {SearchPageProvider} from '@/common/components/react/search-page';
import SearchParameters from '@/common/components/react/search-parameters';
import {SearchStaticState, fetchStaticState} from '@/common/lib/react/engine';

export async function getServerSideProps() {
  // TODO: Enable after URL management investigation https://coveord.atlassian.net/browse/KIT-2824
  //  Unable to obtain search params in getServerSideProps() using either
  //  - https://nextjs.org/docs/app/api-reference/file-conventions/page#searchparams-optional OR
  //  - https://nextjs.org/docs/pages/api-reference/functions/use-router#router-object
  // const {coveoSearchParameters} =
  //   CoveoNextJsSearchParametersSerializer.fromServerSideUrlSearchParams(
  //     url.searchParams
  //   );
  const coveoSearchParameters = {};
  const contextValues = {ageGroup: '30-45', mainInterest: 'sports'};
  const staticState = await fetchStaticState({
    controllers: {
      context: {initialState: {values: contextValues}},
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
