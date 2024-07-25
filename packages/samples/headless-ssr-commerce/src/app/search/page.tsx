import SearchPage from '@/common/components/generic/search-page';
import {SearchSSR} from '@/common/lib/generic/commerce-engine';

// import {buildSSRSearchParameterSerializer} from '@coveo/headless/ssr-commerce';

/**
 * This file defines a Search component that uses the Coveo Headless library to manage its state.
 *
 * The Search function is the entry point for server-side rendering (SSR). It uses the `buildSearchParameterSerializer` util from the Coveo Headless
 * library to serialize the URL search parameters into a string, which is then used by the [UrlManager](https://docs.coveo.com/en/headless/latest/reference/search/controllers/url-manager) controller.
 *
 * To synchronize search parameters with the URL with more control on the serialization, you can use the [SearchParameterManager](https://docs.coveo.com/en/headless/latest/reference/search/controllers/search-parameter-manager/) controller. For the sake of brevity, this sample uses the UrlManager controller.
 *
 * The context values are hard-coded to represent a specific user segment (age group 30-45 with a main interest in sports) as the initial context.
 * These values will be added to the payload of the search request when the search page is rendered.
 */
// export default async function Search(url: {
//   searchParams: {[key: string]: string | string[] | undefined};
// }) {
export default async function Search(url: {
  searchParams: {[key: string]: string | string[] | undefined};
}) {
  // const {toSearchParameters} = buildSSRSearchParameterSerializer();
  // const searchParameters = toSearchParameters(url.searchParams);
  () => {
    url;
  };
  const staticState = await SearchSSR.fetchStaticState({
    controllers: {
      context: {
        // options: {
        //   country: 'US',
        //   currency: 'USD',
        //   language: 'en',
        //   view: {
        //     url: 'https://sports.barca.group/browse/promotions/skis-boards/surfboards',
        //   },
        // },
      },
      // searchParameterManager: {
      //   initialState: {parameters: searchParameters},
      // },
    },
  });
  return <SearchPage staticState={staticState}></SearchPage>; // TODO: convert to listing page
}

// A page with search parameters cannot be statically rendered, since its rendered state should look different based on the current search parameters.
// https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#dynamic
export const dynamic = 'force-dynamic';
