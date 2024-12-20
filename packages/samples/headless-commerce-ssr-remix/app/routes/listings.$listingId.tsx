import BreadcrumbManager from '@/app/components/breadcrumb-manager';
import ContextDropdown from '@/app/components/context-dropdown';
import FacetGenerator from '@/app/components/facets/facet-generator';
import Pagination from '@/app/components/pagination';
import ProductList from '@/app/components/product-list';
import {
  ListingProvider,
  RecommendationProvider,
} from '@/app/components/providers/providers';
import PopularRecommendations from '@/app/components/recommendations/popular-recommendations';
import Sort from '@/app/components/sort';
import StandaloneSearchBox from '@/app/components/standalone-search-box';
import Summary from '@/app/components/summary';
import externalCartService from '@/external-services/external-cart-service';
import externalContextService from '@/external-services/external-context-service';
import {
  listingEngineDefinition,
  ListingStaticState,
  recommendationEngineDefinition,
  RecommendationStaticState,
} from '@/lib/commerce-engine';
import {getNavigatorContext} from '@/lib/navigator-context';
import {
  toCoveoCartItems,
  toCoveoCurrency,
} from '@/utils/external-api-conversions';
import {
  buildParameterSerializer,
  NavigatorContext,
} from '@coveo/headless-react/ssr-commerce';
import {LoaderFunctionArgs} from '@remix-run/node';
import {useLoaderData, useParams} from '@remix-run/react';
import invariant from 'tiny-invariant';
import ParameterManager from '../components/parameter-manager';
import {coveo_visitorId} from '../cookies.server';

export const loader = async ({params, request}: LoaderFunctionArgs) => {
  invariant(params.listingId, 'Missing listingId parameter');

  const navigatorContext = await getNavigatorContext(request);

  const url = new URL(request.url);

  const {deserialize} = buildParameterSerializer();
  const parameters = deserialize(url.searchParams);

  listingEngineDefinition.setNavigatorContextProvider(() => navigatorContext);

  recommendationEngineDefinition.setNavigatorContextProvider(
    () => navigatorContext
  );

  const {country, currency, language} =
    await externalContextService.getContextInformation();

  const items = await externalCartService.getItems();

  const staticState = await listingEngineDefinition.fetchStaticState({
    controllers: {
      cart: {
        initialState: {
          items: toCoveoCartItems(items),
        },
      },
      parameterManager: {
        initialState: {
          parameters: parameters,
        },
      },
      context: {
        language,
        country,
        currency: toCoveoCurrency(currency),
        view: {
          url: `https://sports.barca.group/browse/promotions/${params.listingId}`,
        },
      },
    },
  });

  const recsStaticState = await recommendationEngineDefinition.fetchStaticState(
    {
      controllers: {
        popularViewedRecs: {enabled: true},
        popularBoughtRecs: {enabled: true},
        cart: {
          initialState: {
            items: toCoveoCartItems(items),
          },
        },
        context: {
          language,
          country,
          currency: toCoveoCurrency(currency),
          view: {
            url: 'https://sports.barca.group/cart',
          },
        },
      },
    }
  );

  return {
    staticState,
    navigatorContext,
    recsStaticState,
    headers: {
      'Set-Cookie': await coveo_visitorId.serialize(navigatorContext.clientId),
    },
  };
};

export default function ListingRoute() {
  const params = useParams();
  const {staticState, navigatorContext, recsStaticState} = useLoaderData<{
    staticState: ListingStaticState;
    navigatorContext: NavigatorContext;
    recsStaticState: RecommendationStaticState;
  }>();

  const getTitle = () => {
    return params.listingId
      ?.split('-')
      .map(
        (subString) => subString.charAt(0).toUpperCase() + subString.slice(1)
      )
      .join(' ');
  };

  return (
    <ListingProvider
      staticState={staticState}
      navigatorContext={navigatorContext}
    >
      <ParameterManager url={navigatorContext.location} />
      <h2>{getTitle()}</h2>
      <ContextDropdown useCase="listing" />
      <div style={{display: 'flex', flexDirection: 'row'}}>
        <div style={{flex: 1}}>
          <FacetGenerator />
        </div>

        <div style={{flex: 2}}>
          <StandaloneSearchBox />
          <BreadcrumbManager />
          <Summary />
          <Sort />
          <ProductList />
          {/* The ShowMore and Pagination components showcase two frequent ways to implement pagination. */}
          <Pagination />
          {/* <ShowMore
            staticState={staticState.controllers.pagination.state}
            controller={hydratedState?.controllers.pagination}
            summaryController={hydratedState?.controllers.summary}
          /> */}
        </div>

        <div style={{flex: 4}}>
          <RecommendationProvider
            staticState={recsStaticState}
            navigatorContext={navigatorContext}
          >
            <PopularRecommendations type="bought" />
            <PopularRecommendations type="viewed" />
          </RecommendationProvider>
        </div>
      </div>
    </ListingProvider>
  );
}
