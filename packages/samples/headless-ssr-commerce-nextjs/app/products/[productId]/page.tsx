import {headers} from 'next/headers';
import * as externalCartAPI from '@/actions/external-cart-api';
import ContextDropdown from '@/components/context-dropdown';
import ProductViewer from '@/components/product-viewer';
import {
  RecommendationProvider,
  StandaloneProvider,
} from '@/components/providers/providers';
import ViewedTogether from '@/components/recommendations/viewed-together';
import StandaloneSearchBox from '@/components/standalone-search-box';
import {
  recommendationEngineDefinition,
  standaloneEngineDefinition,
} from '@/lib/commerce-engine';
import {NextJsNavigatorContext} from '@/lib/navigatorContextProvider';
import {defaultContext} from '@/utils/context';

export default async function ProductDescriptionPage({
  params,
  searchParams,
}: {
  params: Promise<{productId: string}>;
  searchParams: Promise<{[key: string]: string | string[] | undefined}>;
}) {
  // Sets the navigator context provider to use the newly created `navigatorContext` before fetching the app static state
  const navigatorContext = new NextJsNavigatorContext(await headers());
  standaloneEngineDefinition.setNavigatorContextProvider(
    () => navigatorContext
  );

  // Fetches the cart items from an external service
  const items = await externalCartAPI.getCart();
  const {productId} = await params;
  // Fetches the static state of the app with initial state (when applicable)
  const staticState = await standaloneEngineDefinition.fetchStaticState({
    controllers: {
      cart: {initialState: {items}},
      context: {
        language: defaultContext.language,
        country: defaultContext.country,
        currency: defaultContext.currency,
        view: {
          url: `https://sports.barca.group/products/${productId}`,
        },
      },
    },
  });

  const recsStaticState = await recommendationEngineDefinition.fetchStaticState(
    {
      controllers: {
        viewedTogether: {enabled: true, productId},
        cart: {initialState: {items}},
        context: {
          language: defaultContext.language,
          country: defaultContext.country,
          currency: defaultContext.currency,
          view: {
            url: `https://sports.barca.group/products/${productId}`,
          },
        },
      },
    }
  );

  const resolvedSearchParams = await searchParams;
  const price = Number(resolvedSearchParams.price) ?? NaN;
  const name = Array.isArray(resolvedSearchParams.name)
    ? productId
    : (resolvedSearchParams.name ?? productId);

  return (
    <StandaloneProvider
      staticState={staticState}
      navigatorContext={navigatorContext.marshal}
    >
      <h2>Product description page</h2>
      <ContextDropdown />
      <StandaloneSearchBox />
      <ProductViewer productId={productId} name={name} price={price} />
      <p>
        {name} ({productId}) - ${price}
      </p>
      <br />

      <RecommendationProvider
        staticState={recsStaticState}
        navigatorContext={navigatorContext.marshal}
      >
        <ViewedTogether />
      </RecommendationProvider>
    </StandaloneProvider>
  );
}

export const dynamic = 'force-dynamic';
