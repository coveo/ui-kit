import type {ContextOptions} from '@coveo/headless-react/ssr-commerce-next';
import * as externalCartAPI from '@/actions/external-cart-api';
import Cart from '@/components/cart';
import ContextDropdown from '@/components/context-dropdown';
import {StandaloneProvider} from '@/components/providers/providers';
import PopularBought from '@/components/recommendations/popular-bought';
import StandaloneSearchBox from '@/components/standalone-search-box';
import {standaloneEngineDefinition} from '@/lib/commerce-engine';
import {getNavigatorContext} from '@/lib/navigator-context';
import {defaultContext} from '@/utils/context';

export default async function Search() {
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

  // One call builds the static state of the page and requests its recommendation slot.
  const staticState = await standaloneEngineDefinition.fetchStaticState({
    cart: {items},
    context,
    navigatorContext,
    recommendations: ['popularBought'],
    controllers: {
      productEnrichment: {
        options: {
          placementIds: ['70b493b2-a1f1-4049-ad70-16695cef39cd'],
        },
      },
    },
  });
  return (
    <StandaloneProvider staticState={staticState}>
      <div style={{display: 'flex', flexDirection: 'column'}}>
        <ContextDropdown />
        <StandaloneSearchBox />
        <Cart />
        <PopularBought />
      </div>
    </StandaloneProvider>
  );
}

export const dynamic = 'force-dynamic';
