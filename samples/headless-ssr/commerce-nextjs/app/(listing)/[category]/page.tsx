import {buildParameterSerializer} from '@coveo/headless-react/ssr-commerce';
import {headers} from 'next/headers';
import {notFound} from 'next/navigation';
import * as externalCartAPI from '@/actions/external-cart-api';
import BreadcrumbManager from '@/components/breadcrumb-manager';
import FacetGenerator from '@/components/facets/facet-generator';
import Pagination from '@/components/pagination';
import ParameterManager from '@/components/parameter-manager';
import ProductList from '@/components/product-list';
import {ListingProvider, RecommendationProvider} from '@/components/providers/providers';
import PopularBought from '@/components/recommendations/popular-bought';
import PopularViewed from '@/components/recommendations/popular-viewed';
import Sort from '@/components/sort';
import StandaloneSearchBox from '@/components/standalone-search-box';
import Summary from '@/components/summary';
import {listingEngineDefinition, recommendationEngineDefinition} from '@/lib/commerce-engine';
import {NextJsNavigatorContext} from '@/lib/navigatorContextProvider';
import {defaultContext} from '@/utils/context';

// Categories available in the sample merchandising hub. In a real storefront
// these would come from your catalog rather than a hardcoded list.
const categoryList = ['surf-accessories', 'paddleboards', 'toys'];

export default async function Listing({
  params,
  searchParams,
}: {
  params: Promise<{category: string}>;
  searchParams: Promise<URLSearchParams>;
}) {
  const {category} = await params;

  if (!categoryList.includes(category)) {
    notFound();
  }

  // Set the navigator context provider before fetching the app static state.
  const navigatorContext = new NextJsNavigatorContext(await headers());
  listingEngineDefinition.setNavigatorContextProvider(() => navigatorContext);

  const {deserialize} = buildParameterSerializer();
  const parameters = deserialize(await searchParams);

  // Fetch the cart items from the external service.
  const items = await externalCartAPI.getCart();

  const staticState = await listingEngineDefinition.fetchStaticState({
    controllers: {
      cart: {initialState: {items}},
      context: {
        language: defaultContext.language,
        country: defaultContext.country,
        currency: defaultContext.currency,
        view: {
          url: `https://sports.barca.group/browse/promotions/${category}`,
        },
      },
      parameterManager: {initialState: {parameters}},
    },
  });

  const recsStaticState = await recommendationEngineDefinition.fetchStaticState({
    controllers: {
      popularBought: {enabled: true},
      popularViewed: {enabled: true},
      cart: {initialState: {items}},
      context: {
        language: defaultContext.language,
        country: defaultContext.country,
        currency: defaultContext.currency,
        view: {
          url: `https://sports.barca.group/browse/promotions/${category}`,
        },
      },
    },
  });

  return (
    <ListingProvider staticState={staticState} navigatorContext={navigatorContext.marshal}>
      <ParameterManager url={navigatorContext.location} />
      <StandaloneSearchBox />
      <div className="PageLayout">
        <aside className="Sidebar">
          <FacetGenerator />
        </aside>
        <div className="Results">
          <div className="Toolbar">
            <Summary />
            <Sort />
          </div>
          <BreadcrumbManager />
          <ProductList />
          <Pagination />
        </div>
      </div>
      <RecommendationProvider
        staticState={recsStaticState}
        navigatorContext={navigatorContext.marshal}
      >
        <section className="Recommendations">
          <PopularBought />
          <PopularViewed />
        </section>
      </RecommendationProvider>
    </ListingProvider>
  );
}

export const dynamic = 'force-dynamic';
