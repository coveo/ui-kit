import type {ContextOptions} from '@coveo/headless-react/ssr-commerce-next';
import {headers} from 'next/headers';
import * as externalCartAPI from '@/actions/external-cart-api';
import ContextDropdown from '@/components/context-dropdown';
import ProductBadges from '@/components/product-badges';
import ProductViewer from '@/components/product-viewer';
import {RecommendationProvider, StandaloneProvider} from '@/components/providers/providers';
import ViewedTogether from '@/components/recommendations/viewed-together';
import StandaloneSearchBox from '@/components/standalone-search-box';
import {recommendationEngineDefinition, standaloneEngineDefinition} from '@/lib/commerce-engine';
import {NextJsNavigatorContext} from '@/lib/navigatorContextProvider';
import {defaultContext} from '@/utils/context';

export default async function ProductDescriptionPage({
  params,
  searchParams,
}: {
  params: Promise<{productId: string}>;
  searchParams: Promise<{[key: string]: string | string[] | undefined}>;
}) {
  // Builds the navigator context from the request headers. It is passed to every `fetchStaticState` call.
  const navigatorContext = new NextJsNavigatorContext(await headers());

  // Fetches the cart items from an external service
  const items = await externalCartAPI.getCart();
  const {productId} = await params;

  // Define the context options for listing and recommendations
  const context: ContextOptions = {
    language: defaultContext.language,
    country: defaultContext.country,
    currency: defaultContext.currency,
    view: {
      url: `https://sports.barca.group/products/${productId}`,
    },
  };

  // Fetches the static state of the app with initial state (when applicable)
  const staticState = await standaloneEngineDefinition.fetchStaticState({
    cart: {items},
    context,
    navigatorContext: navigatorContext.marshal,
    controllers: {
      productEnrichment: {
        options: {
          productId,
          placementIds: ['70b493b2-a1f1-4049-ad70-16695cef39cd'],
        },
      },
    },
  });

  // The product ID seeds the "viewed together" slot with the product being viewed.
  const recsStaticState = await recommendationEngineDefinition.fetchStaticState({
    cart: {items},
    context,
    navigatorContext: navigatorContext.marshal,
    recommendations: ['viewedTogether'],
    productId,
  });

  const resolvedSearchParams = await searchParams;
  const price = Number(resolvedSearchParams.price);
  const name = Array.isArray(resolvedSearchParams.name)
    ? productId
    : (resolvedSearchParams.name ?? productId);

  return (
    <StandaloneProvider staticState={staticState}>
      <h2>Product description page</h2>
      <ContextDropdown />
      <StandaloneSearchBox />
      <ProductViewer productId={productId} name={name} price={price} />
      <p>
        {name} ({productId}) - ${price}
      </p>
      <ProductBadges />
      <br />

      <RecommendationProvider staticState={recsStaticState}>
        <ViewedTogether />
      </RecommendationProvider>
    </StandaloneProvider>
  );
}

export const dynamic = 'force-dynamic';
