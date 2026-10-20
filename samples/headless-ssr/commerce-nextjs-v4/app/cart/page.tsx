import type {ContextOptions} from '@coveo/headless-react/ssr-commerce-next';
import * as externalCartAPI from '@/actions/external-cart-api';
import Cart from '@/components/cart';
import ContextDropdown from '@/components/context-dropdown';
import {RecommendationProvider, StandaloneProvider} from '@/components/providers/providers';
import PopularBought from '@/components/recommendations/popular-bought';
import StandaloneSearchBox from '@/components/standalone-search-box';
import {recommendationEngineDefinition, standaloneEngineDefinition} from '@/lib/commerce-engine';
import {getNavigatorContext} from '@/lib/navigator-context';
import {defaultContext} from '@/utils/context';

export default async function CartPage() {
  // The navigator context describes the visitor's browser. It is passed to every `fetchStaticState` call.
  const navigatorContext = await getNavigatorContext();

  // Fetches the cart items from an external service
  const items = await externalCartAPI.getCart();

  // Define the context options for listing and recommendations
  const context: ContextOptions = {
    language: defaultContext.language,
    country: defaultContext.country,
    currency: defaultContext.currency,
    view: {
      url: 'https://sports.barca.group/cart',
    },
  };

  // Fetches the static state of the app with initial state (when applicable)
  const staticState = await standaloneEngineDefinition.fetchStaticState({
    cart: {items},
    context,
    navigatorContext,
    controllers: {
      productEnrichment: {
        options: {
          placementIds: ['70b493b2-a1f1-4049-ad70-16695cef39cd'],
        },
      },
    },
  });

  const recsStaticState = await recommendationEngineDefinition.fetchStaticState({
    cart: {items},
    context,
    navigatorContext,
    recommendations: ['popularBought', 'popularViewed'],
  });
  return (
    <StandaloneProvider staticState={staticState}>
      <div style={{display: 'flex', flexDirection: 'column'}}>
        <ContextDropdown />
        <StandaloneSearchBox />
        <Cart />
        <RecommendationProvider staticState={recsStaticState}>
          <PopularBought />
        </RecommendationProvider>
      </div>
    </StandaloneProvider>
  );
}

export const dynamic = 'force-dynamic';
