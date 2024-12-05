import * as externalCartAPI from '@/actions/external-cart-api';
import ContextDropdown from '@/components/context-dropdown';
import {
  RecommendationProvider,
  StandaloneProvider,
} from '@/components/providers/providers';
import PurchasedTogether from '@/components/recommendations/purchased-together';
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

  // Fetches the static state of the app with initial state (when applicable)
  const staticState = await standaloneEngineDefinition.fetchStaticState({
    controllers: {
      cart: {initialState: {items}},
      popularBought: {}, // TODO:: KIT-3782: should not be required on listing engine definition
      popularViewed: {}, // TODO:: KIT-3782: should not be required on listing engine definition
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
        cart: {initialState: {items}},
        purchasedTogether: {enabled: true, productId: params.productId},
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
  const name = resolvedSearchParams.name ?? params.productId;

  return (
    <StandaloneProvider
      staticState={staticState}
      navigatorContext={navigatorContext.marshal}
    >
      <h2>Product description page</h2>
      <ContextDropdown />
      <StandaloneSearchBox />
      <p>
        {name} ({params.productId}) - ${price}
      </p>
      <br />
      <div style={{flex: 4}}>
        <RecommendationProvider
          staticState={recsStaticState}
          navigatorContext={navigatorContext.marshal}
        >
          <PurchasedTogether />
        </RecommendationProvider>
      </div>
    </StandaloneProvider>
  );
}

export const dynamic = 'force-dynamic';
