import {NextJSServerSideSearchParams} from '@/common/components/common/search-parameters-serializer';
import {AuthorFacet} from '@/common/components/react/facets';
import ResultList from '@/common/components/react/result-list';
import SearchBox from '@/common/components/react/search-box';
import {SearchPageProvider} from '@/common/components/react/search-page';
import SearchParameters from '@/common/components/react/search-parameters';
import {SearchStaticState, fetchStaticState} from '@/common/lib/react/engine';
import {buildSearchParameterSerializer} from '@coveo/headless';

export async function getServerSideProps(context: {
  query: NextJSServerSideSearchParams;
}) {
  const fragment = buildSearchParameterSerializer().serialize(context.query);
  const staticState = await fetchStaticState({
    controllers: {
      urlManager: {
        initialState: {fragment},
      },
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
