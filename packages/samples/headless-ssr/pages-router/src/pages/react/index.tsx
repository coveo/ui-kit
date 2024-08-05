import {AuthorFacet} from '@/common/components/react/facets';
import ResultList from '@/common/components/react/result-list';
import SearchBox from '@/common/components/react/search-box';
import {SearchPageProvider} from '@/common/components/react/search-page';
import SearchSearchParameterManager from '@/common/components/react/search-parameter-manager';
import {NextJsNavigatorContext} from '@/common/lib/navigatorContextProvider';
import {
  SearchStaticState,
  fetchStaticState,
  setNavigatorContextProvider,
} from '@/common/lib/react/engine';
import {buildSSRSearchParameterSerializer} from '@coveo/headless-react/ssr';
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
    <SearchPageProvider
      navigatorContext={navigatorContext.marshal}
      staticState={staticState}
    >
      <SearchSearchParameterManager />
      <SearchBox />
      <ResultList />
      <AuthorFacet />
    </SearchPageProvider>
  );
}
