import {
  buildCommerceEngine,
  buildProductListing,
  getSampleCommerceEngineConfiguration,
} from '@coveo/headless/commerce';
import {useMemo} from 'react';
import {ProductListing} from '../../components/commerce/product-listing.fn';
import {AppContext} from '../../context/engine';
import {Section} from '../../layout/section';

export function ProductListingPage() {
  const engine = useMemo(
    () =>
      buildCommerceEngine({
        configuration: getSampleCommerceEngineConfiguration(),
      }),
    []
  );

  const productListing = buildProductListing(engine);

  return (
    <AppContext.Provider value={{commerceEngine: engine}}>
      <Section title="product-listing">
        <ProductListing controller={productListing} />
      </Section>
    </AppContext.Provider>
  );
}
