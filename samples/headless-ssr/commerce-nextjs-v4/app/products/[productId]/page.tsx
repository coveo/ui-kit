import type {ContextOptions} from '@coveo/headless-react/ssr-commerce-next';
import * as externalCartAPI from '@/actions/external-cart-api';
import ContextDropdown from '@/components/context-dropdown';
import ProductBadges from '@/components/product-badges';
import ProductViewer from '@/components/product-viewer';
import {StandaloneProvider} from '@/components/providers/providers';
import ViewedTogether from '@/components/recommendations/viewed-together';
import StandaloneSearchBox from '@/components/standalone-search-box';
import {standaloneEngineDefinition} from '@/lib/commerce-engine';
import {getNavigatorContext} from '@/lib/navigator-context';
import {defaultContext} from '@/utils/context';

export default async function ProductDescriptionPage({
  params,
  searchParams,
}: {
  params: Promise<{productId: string}>;
  searchParams: Promise<{[key: string]: string | string[] | undefined}>;
}) {
  // The navigator context describes the visitor's browser. It is passed to every `fetchStaticState` call.
  const navigatorContext = await getNavigatorContext();

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

  // The product ID seeds the "viewed together" slot with the product being viewed.
  const staticState = await standaloneEngineDefinition.fetchStaticState({
    cart: {items},
    context,
    navigatorContext,
    recommendations: ['viewedTogether'],
    productId,
    controllers: {
      productEnrichment: {
        options: {
          productId,
          placementIds: ['70b493b2-a1f1-4049-ad70-16695cef39cd'],
        },
      },
    },
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

      <ViewedTogether />
    </StandaloneProvider>
  );
}

export const dynamic = 'force-dynamic';
