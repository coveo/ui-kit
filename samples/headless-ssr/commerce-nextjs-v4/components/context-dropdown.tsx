'use client';

import {
  type CommerceEngine,
  type ContextOptions,
  loadProductListingActions,
  loadSearchActions,
} from '@coveo/headless-react/ssr-commerce-next';
import {useContext, useEngine} from '@/lib/commerce-engine';

// A hardcoded list of storefront associations for switching app context by language, country, and currency.
// Found in the admin console under "Storefront Associations," this list is static for demonstration purposes.
// In a real application, these values would likely come from sources like environment variables or an API.
const storefrontAssociations = [
  'en-CA-CAD',
  'fr-CA-CAD',
  'en-GB-GBP',
  'en-US-USD',
];

export default function ContextDropdown({
  useCase,
}: {
  useCase?: 'listing' | 'search';
}) {
  const {state, methods} = useContext();
  const engine = useEngine();

  return (
    <div>
      <p></p>
      Context dropdown :
      <select
        value={`${state.language}-${state.country}-${state.currency}`}
        onChange={(e) => {
          const [language, country, currency] = e.target.value.split('-');
          methods?.setLanguage(language);
          methods?.setCountry(country);
          methods?.setCurrency(currency as ContextOptions['currency']);

          useCase === 'search'
            ? engine?.dispatch(
                loadSearchActions(engine as CommerceEngine).executeSearch()
              )
            : useCase === 'listing' &&
              engine?.dispatch(
                loadProductListingActions(
                  engine as CommerceEngine
                ).fetchProductListing()
              );
        }}
      >
        {storefrontAssociations.map((association) => (
          <option key={association} value={association}>
            {association}
          </option>
        ))}
      </select>
      <p></p>
    </div>
  );
}
