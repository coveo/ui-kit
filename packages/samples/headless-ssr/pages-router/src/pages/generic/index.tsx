import SearchPage from '@/common/components/generic/search-page';
import {SearchStaticState, fetchStaticState} from '@/common/lib/generic/engine';

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
  return <SearchPage staticState={staticState}></SearchPage>;
}
