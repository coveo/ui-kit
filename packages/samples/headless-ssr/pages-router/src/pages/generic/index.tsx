import {CoveoNextJsSearchParametersSerializer} from '@/src/components/common/search-parameters-serializer';
import {SearchStaticState, fetchStaticState} from '@/src/lib/generic/engine';
import SearchPage from '@/src/components/generic/search-page';

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
  return <SearchPage staticState={staticState}></SearchPage>;
}
