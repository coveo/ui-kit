import {
  buildCommerceEngine,
  buildProductListing,
  buildRecommendations,
  buildSearch,
} from '@coveo/headless/commerce';
import {getSampleCommerceEngineConfiguration} from '@coveo/headless/commerce';
import {useMemo} from 'react';
import {ProductListing} from '../components/commerce/product-listing.fn';
import {Recommendations} from '../components/commerce/recommendations.fn';
import {Search} from '../components/commerce/search.fn';
import {AppContext} from '../context/engine';
import {Section} from '../layout/section';

export default function CommercePage() {
  const engine = useMemo(
    () =>
      buildCommerceEngine({
        configuration: getSampleCommerceEngineConfiguration(),
      }),
    []
  );

  const productListing = buildProductListing(engine);
  const search = buildSearch(engine);
  const recommendations = buildRecommendations(engine, {
    options: {
      slotId: 'abccdea4-7d8d-4d56-b593-20267083f88f',
    },
  });

  return (
    <AppContext.Provider value={{commerceEngine: engine}}>
      <Section title="product-listing">
        <ProductListing controller={productListing} />
      </Section>
      <Section title="search">
        <Search controller={search} />
      </Section>
      <Section title="recommendations">
        <Recommendations controller={recommendations} />
      </Section>
    </AppContext.Provider>
  );
}
