import {
  buildSSRSearchParameterSerializer,
  type NavigatorContext,
} from '@coveo/headless-react/ssr';
import type {GetServerSidePropsContext} from 'next';
import {AuthorFacet} from '@/common/components/react/facets';
import ResultList from '@/common/components/react/result-list';
import SearchBox from '@/common/components/react/search-box';
import {SearchPageProvider} from '@/common/components/react/search-page';
import SearchSearchParameterManager from '@/common/components/react/search-parameter-manager';
import TabManager from '@/common/components/react/tab-manager';
import {
  fetchStaticState,
  type SearchStaticState,
  setNavigatorContextProvider,
} from '@/common/lib/react/engine';
import {NextJsPagesRouterNavigatorContext} from '../../navigatorContextProvider';

export async function getServerSideProps(context: GetServerSidePropsContext) {
  // Sets the navigator context provider to use the newly created `navigatorContext` before fetching the app static state
  const navigatorContext = new NextJsPagesRouterNavigatorContext(
    context.req.headers
  );
  setNavigatorContextProvider(() => navigatorContext);
  const marshal = navigatorContext.marshal;

  const {toSearchParameters} = buildSSRSearchParameterSerializer();
  const searchParameters = toSearchParameters(context.query);

  const contextValues = {ageGroup: '30-45', mainInterest: 'sports'};
  const staticState = await fetchStaticState({
    controllers: {
      context: {initialState: {values: contextValues}},
      searchParameterManager: {
        initialState: {parameters: searchParameters},
      },
    },
  });

  return {props: {staticState, marshal}};
}

interface StaticStateProps {
  staticState: SearchStaticState;
  marshal: NavigatorContext;
}

// Entry point SSR function
export default function Search({staticState, marshal}: StaticStateProps) {
  return (
    <SearchPageProvider navigatorContext={marshal} staticState={staticState}>
      <SearchSearchParameterManager />
      <SearchBox />
      <TabManager />
      <ResultList />
      <AuthorFacet />
    </SearchPageProvider>
  );
}
