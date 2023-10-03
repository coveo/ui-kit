import {CoveoNextJsSearchParametersSerializer} from '@/src/common/search-parameters-serializer';
import {
  SearchStaticState,
  fetchStaticState,
} from '@/src/pages/generic/common/engine';
import SearchPage from '@/src/pages/generic/components/search-page';

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
