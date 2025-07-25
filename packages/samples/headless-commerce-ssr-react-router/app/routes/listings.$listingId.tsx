import {
  buildParameterSerializer,
  type NavigatorContext,
  SolutionType,
} from '@coveo/headless-react/ssr-commerce';
import type {LoaderFunctionArgs} from 'react-router';
import {useLoaderData, useParams} from 'react-router';
import invariant from 'tiny-invariant';
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
import Summary from '@/app/components/summary';
import type {
  ListingStaticState,
  RecommendationStaticState,
} from '@/lib/commerce-engine';
import {
  getBaseFetchStaticStateConfiguration,
  getEngineDefinition,
} from '@/lib/commerce-engine.server';
import {getNavigatorContext} from '@/lib/navigator-context';
import ParameterManager from '../components/parameter-manager.js';
import NotifyTrigger from '../components/triggers/notify-trigger.js';

export const loader = async ({params, request}: LoaderFunctionArgs) => {
  invariant(params.listingId, 'Missing listingId parameter');

  const navigatorContext = await getNavigatorContext(request);

  const url = new URL(request.url);
  const {deserialize} = buildParameterSerializer();
  const parameters = deserialize(url.searchParams);

  const listingEngineDefinition = await getEngineDefinition(
    navigatorContext,
    request,
    SolutionType.listing
  );

  const baseFetchStaticStateConfiguration =
    await getBaseFetchStaticStateConfiguration(
      `/browse/promotions/${params.listingId}`
    );

  const listingStaticState = await listingEngineDefinition.fetchStaticState({
    controllers: {
      ...baseFetchStaticStateConfiguration.controllers,
      parameterManager: {
        initialState: {
          parameters,
        },
      },
    },
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

  return Response.json({listingStaticState, navigatorContext, recsStaticState});
};

export default function ListingRoute() {
  const params = useParams();
  const {listingStaticState, navigatorContext, recsStaticState} =
    useLoaderData<{
      listingStaticState: ListingStaticState;
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
      staticState={listingStaticState}
      navigatorContext={navigatorContext}
    >
      <ParameterManager url={navigatorContext.location} />
      <h2>{getTitle()}</h2>
      <NotifyTrigger />
      <ContextDropdown useCase="listing" />
      <div style={{display: 'flex', flexDirection: 'row'}}>
        <div style={{flex: 1}}>
          <FacetGenerator />
        </div>

        <div style={{flex: 2}}>
          <BreadcrumbManager />
          <Summary />
          <Sort />
          <ProductList />

          {/* The `Pagination` and `ShowMore` components showcase two frequent but mutually exclusive ways to implement
              pagination. */}

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
