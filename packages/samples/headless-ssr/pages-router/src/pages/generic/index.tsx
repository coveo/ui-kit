import {
  buildSSRSearchParameterSerializer,
  type NavigatorContext,
} from '@coveo/headless/ssr';
import type {GetServerSidePropsContext} from 'next';
import SearchPage from '@/common/components/generic/search-page';
import {
  fetchStaticState,
  type SearchStaticState,
  setNavigatorContextProvider,
} from '@/common/lib/generic/engine';
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
    <SearchPage
      navigatorContext={marshal}
      staticState={staticState}
    ></SearchPage>
  );
}
