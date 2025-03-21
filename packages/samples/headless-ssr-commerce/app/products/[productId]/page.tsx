import * as externalCartAPI from '@/actions/external-cart-api';
import * as externalQueriesAPI from '@/actions/external-recent-queries-api';
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
import {headers} from 'next/headers';

export default async function ProductDescriptionPage({
  params,
  searchParams,
}: {
  params: {productId: string};
  searchParams: Promise<{[key: string]: string | string[] | undefined}>;
}) {
  // Sets the navigator context provider to use the newly created `navigatorContext` before fetching the app static state
  const navigatorContext = new NextJsNavigatorContext(headers());
  standaloneEngineDefinition.setNavigatorContextProvider(
    () => navigatorContext
  );

  // Fetches the cart items from an external service
  const items = await externalCartAPI.getCart();

  // Fetches recent queries from an external service
  const queries = await externalQueriesAPI.getRecentQueries();

  // Fetches the static state of the app with initial state (when applicable)
  const staticState = await standaloneEngineDefinition.fetchStaticState({
    controllers: {
      recentQueriesList: {initialState: {queries}},
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

  const recsStaticState = await recommendationEngineDefinition.fetchStaticState(
    {
      controllers: {
        viewedTogether: {enabled: true, productId: params.productId},
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
    }
  );

  const resolvedSearchParams = await searchParams;
  const price = Number(resolvedSearchParams.price) ?? NaN;
  const name = Array.isArray(resolvedSearchParams.name)
    ? params.productId
    : (resolvedSearchParams.name ?? params.productId);

  return (
    <StandaloneProvider
      staticState={staticState}
      navigatorContext={navigatorContext.marshal}
    >
      <h2>Product description page</h2>
      <ContextDropdown />
      <StandaloneSearchBox />
      <ProductViewer productId={params.productId} name={name} price={price} />
      <p>
        {name} ({params.productId}) - ${price}
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
