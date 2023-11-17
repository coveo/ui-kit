import {AuthorFacet} from '@/common/components/react/facets';
import ResultList from '@/common/components/react/result-list';
import SearchBox from '@/common/components/react/search-box';
import {SearchPageProvider} from '@/common/components/react/search-page';
import UrlManager from '@/common/components/react/url-manager';
import {SearchStaticState, fetchStaticState} from '@/common/lib/react/engine';
import {buildSearchParameterSerializer} from '@coveo/headless';

export async function getServerSideProps(context: {
  query: {[key: string]: string | string[] | undefined};
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
      <UrlManager />
      <SearchBox />
      <ResultList />
      <AuthorFacet />
    </SearchPageProvider>
  );
}
