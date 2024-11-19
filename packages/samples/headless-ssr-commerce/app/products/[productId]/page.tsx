import * as externalCartAPI from '@/actions/external-cart-api';
import ContextDropdown from '@/components/context-dropdown';
import ProductPage from '@/components/pages/product-page';
import StandaloneProvider from '@/components/providers/standalone-provider';
import StandaloneSearchBox from '@/components/standalone-search-box';
import {searchEngineDefinition} from '@/lib/commerce-engine';
import {NextJsNavigatorContext} from '@/lib/navigatorContextProvider';
import {defaultContext} from '@/utils/context';
import {headers} from 'next/headers';
import {Suspense} from 'react';

export default async function ProductDescriptionPage({
  params,
}: {
  params: {productId: string};
}) {
  // Sets the navigator context provider to use the newly created `navigatorContext` before fetching the app static state
  const navigatorContext = new NextJsNavigatorContext(headers());
  searchEngineDefinition.setNavigatorContextProvider(() => navigatorContext);

  // Fetches the cart items from an external service
  const items = await externalCartAPI.getCart();

  // Fetches the static state of the app with initial state (when applicable)
  const staticState = await searchEngineDefinition.fetchStaticState({
    controllers: {
      cart: {initialState: {items}},
      context: {
        language: defaultContext.language,
        country: defaultContext.country,
        currency: defaultContext.currency,
        view: {
          url: `https://sports.barca.group/products/${params.productId}`,
        },
      },
    },
  });
  return (
    <StandaloneProvider
      staticState={staticState}
      navigatorContext={navigatorContext.marshal}
    >
      <h2>Product description page</h2>
      <ContextDropdown />
      <StandaloneSearchBox />
      <Suspense fallback={<p>Loading...</p>}>
        <ProductPage
          staticState={staticState}
          navigatorContext={navigatorContext.marshal}
          productId={params.productId}
        />
      </Suspense>
    </StandaloneProvider>
  );
}

export const dynamic = 'force-dynamic';
