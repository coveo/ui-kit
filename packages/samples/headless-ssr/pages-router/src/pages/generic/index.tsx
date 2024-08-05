import SearchPage from '@/common/components/generic/search-page';
import {
  SearchStaticState,
  fetchStaticState,
  setNavigatorContextProvider,
} from '@/common/lib/generic/engine';
import {NextJsNavigatorContext} from '@/common/lib/navigatorContextProvider';
import {buildSSRSearchParameterSerializer} from '@coveo/headless/ssr';
import {headers} from 'next/headers';

export async function getServerSideProps(context: {
  query: {[key: string]: string | string[] | undefined};
}) {
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
  return {props: {staticState}};
}

interface StaticStateProps {
  staticState: SearchStaticState;
}

// Entry point SSR function
export default function Search({staticState}: StaticStateProps) {
  // Sets the navigator context provider to use the newly created `navigatorContext` before fetching the app static state
  const navigatorContext = new NextJsNavigatorContext(headers());
  setNavigatorContextProvider(() => navigatorContext);

  return (
    <SearchPage
      navigatorContext={navigatorContext.marshal}
      staticState={staticState}
    ></SearchPage>
  );
}
