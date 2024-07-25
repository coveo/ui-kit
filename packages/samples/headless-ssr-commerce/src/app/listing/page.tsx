'use server';

import ListingPage from '@/common/components/generic/listing-page';
import {CustomContextProvider} from '@/common/components/navigatorContext';
import {fetchStaticState} from '@/common/lib/generic/commerce-engine';
import {headers} from 'next/headers';

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
export default async function Listing() {
  const navigatorContext = () => new CustomContextProvider(headers()).marshal;

  const staticState = await fetchStaticState({
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

  return (
    <ListingPage
      staticState={staticState}
      navigatorContext={navigatorContext()}
    ></ListingPage>
  );
  // return <></>;
}

// export const dynamic = 'force-dynamic';
