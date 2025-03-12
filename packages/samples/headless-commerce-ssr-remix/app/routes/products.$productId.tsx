import ContextDropdown from '@/app/components/context-dropdown';
import ProductView from '@/app/components/product-view';
import {StandaloneProvider} from '@/app/components/providers/providers';
import externalCartService, {
  ExternalCartItem,
} from '@/external-services/external-cart-service';
import externalCatalogAPI, {
  ExternalCatalogItem,
} from '@/external-services/external-catalog-service';
import externalContextService from '@/external-services/external-context-service';
import {StandaloneStaticState} from '@/lib/commerce-engine';
import {
  getBaseFetchStaticStateConfiguration,
  getEngineDefinition,
} from '@/lib/commerce-engine.server';
import {getNavigatorContext} from '@/lib/navigator-context';
import {
  NavigatorContext,
  SolutionType,
} from '@coveo/headless-react/ssr-commerce';
import {LoaderFunctionArgs} from '@remix-run/node';
import {useLoaderData} from '@remix-run/react';
import invariant from 'tiny-invariant';

export const loader = async ({params, request}: LoaderFunctionArgs) => {
  const productId = params.productId;

  invariant(productId, 'Missing productId parameter');

  const catalogItem = await externalCatalogAPI.getItem(request.url);

  const {currency, language} =
    await externalContextService.getContextInformation();

  const {navigatorContext} = await getNavigatorContext(request);

  const standaloneEngineDefinition = await getEngineDefinition(
    navigatorContext,
    request,
    SolutionType.standalone
  );

  const baseFetchStaticStateConfiguration =
    await getBaseFetchStaticStateConfiguration(new URL(request.url).pathname);

  const staticState = await standaloneEngineDefinition.fetchStaticState(
    baseFetchStaticStateConfiguration
  );

  const cartItem = await externalCartService.getItem(productId);

  return Response.json({
    staticState,
    navigatorContext,
    catalogItem,
    cartItem,
    language,
    currency,
  });
};

export default function ProductRoute() {
  const {
    staticState,
    navigatorContext,
    catalogItem,
    cartItem,
    language,
    currency,
  } = useLoaderData<{
    staticState: StandaloneStaticState;
    navigatorContext: NavigatorContext;
    productId: string;
    catalogItem: ExternalCatalogItem;
    cartItem: ExternalCartItem | null;
    language: string;
    currency: string;
  }>();

  return (
    <StandaloneProvider
      staticState={staticState}
      navigatorContext={navigatorContext}
    >
      <ContextDropdown />
      <ProductView
        catalogItem={catalogItem}
        cartItem={cartItem}
        language={language}
        currency={currency}
      />
    </StandaloneProvider>
  );
}
