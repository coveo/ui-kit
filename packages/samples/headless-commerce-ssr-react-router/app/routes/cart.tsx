import {
  type NavigatorContext,
  SolutionType,
} from '@coveo/headless-react/ssr-commerce';
import type {LoaderFunctionArgs} from 'react-router';
import {useLoaderData} from 'react-router';
import Cart from '@/app/components/cart';
import ContextDropdown from '@/app/components/context-dropdown';
import {
  RecommendationProvider,
  StandaloneProvider,
} from '@/app/components/providers/providers';
import PopularRecommendations from '@/app/components/recommendations/popular-recommendations';
import externalCartService, {
  type ExternalCartItem,
} from '@/external-services/external-cart-service';
import externalContextService from '@/external-services/external-context-service';
import type {
  RecommendationStaticState,
  StandaloneStaticState,
} from '@/lib/commerce-engine';
import {
  getBaseFetchStaticStateConfiguration,
  getEngineDefinition,
} from '@/lib/commerce-engine.server';
import {getNavigatorContext} from '@/lib/navigator-context';

export const loader = async ({request}: LoaderFunctionArgs) => {
  const navigatorContext = await getNavigatorContext(request);

  const items = await externalCartService.getItems();
  const totalPrice = await externalCartService.getTotalPrice();
  const {currency, language} =
    await externalContextService.getContextInformation();

  const baseFetchStaticStateConfiguration =
    await getBaseFetchStaticStateConfiguration(new URL(request.url).pathname);

  const standaloneEngineDefinition = await getEngineDefinition(
    navigatorContext,
    request,
    SolutionType.standalone
  );

  const staticState = await standaloneEngineDefinition.fetchStaticState({
    ...baseFetchStaticStateConfiguration,
  });

  const recommendationEngineDefinition = await getEngineDefinition(
    navigatorContext,
    request,
    SolutionType.recommendation
  );

  const recsStaticState = await recommendationEngineDefinition.fetchStaticState(
    {
      controllers: {
        ...baseFetchStaticStateConfiguration.controllers,
        popularViewedRecs: {enabled: true},
        popularBoughtRecs: {enabled: true},
      },
    }
  );

  return Response.json({
    staticState,
    navigatorContext,
    items,
    totalPrice,
    language,
    currency,
    recsStaticState,
  });
};

export default function CartRoute() {
  const {
    staticState,
    navigatorContext,
    items,
    totalPrice,
    language,
    currency,
    recsStaticState,
  } = useLoaderData<{
    staticState: StandaloneStaticState;
    navigatorContext: NavigatorContext;
    items: ExternalCartItem[];
    totalPrice: number;
    language: string;
    currency: string;
    recsStaticState: RecommendationStaticState;
  }>();

  return (
    <StandaloneProvider
      staticState={staticState}
      navigatorContext={navigatorContext}
    >
      <h2>Cart</h2>
      <div style={{display: 'flex', flexDirection: 'column'}}>
        <ContextDropdown />
        <Cart
          items={items}
          totalPrice={totalPrice}
          language={language}
          currency={currency}
        />
        <RecommendationProvider
          staticState={recsStaticState}
          navigatorContext={navigatorContext}
        >
          <PopularRecommendations type="bought" />
        </RecommendationProvider>
      </div>
    </StandaloneProvider>
  );
}
