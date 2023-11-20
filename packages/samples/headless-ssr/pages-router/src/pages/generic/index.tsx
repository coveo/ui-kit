import SearchPage from '@/common/components/generic/search-page';
import {SearchStaticState, fetchStaticState} from '@/common/lib/generic/engine';
import {buildSearchParameterSerializer} from '@coveo/headless';

export async function getServerSideProps(context: {
  query: {[key: string]: string | string[] | undefined};
}) {
  const fragment = buildSearchParameterSerializer().serialize(context.query);
  const contextValues = {ageGroup: '30-45', mainInterest: 'sports'};
  const staticState = await fetchStaticState({
    controllers: {
      context: {initialState: {values: contextValues}},
      urlManager: {initialState: {fragment}},
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
