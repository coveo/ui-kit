'use client';

import {useContext} from '@/lib/commerce-engine';
import {ContextOptions} from '@coveo/headless-react/ssr-commerce';

const storefrontAssociations = [
  'en-CA-CAD',
  'fr-CA-CAD',
  'en-GB-GBP',
  'en-US-USD',
];

export default function ContextDropdown() {
  const {state, controller} = useContext();
  // const engine = useEngine();
  // const {executeSearch} = loadSearchActions(engine as CommerceEngine);
  // const {fetchProductListing} = loadProductListingActions(
  //   engine as CommerceEngine
  // );
  // const {fetchProductListing} = loadProductListingActions(
  //   engine as CommerceEngine
  // );

  return (
    <div>
      <p>AAA</p>
      Context slider {state.country} {state.currency} {state.language}
      <select
        value={`${state.language}-${state.country}-${state.currency}`}
        onChange={(e) => {
          const [language, country, currency] = e.target.value.split('-');
          controller?.setLanguage(language);
          controller?.setCountry(country);
          controller?.setCurrency(currency as ContextOptions['currency']);
          // engine?.dispatch(executeSearch());
          // engine?.dispatch(fetchProductListing());
        }}
      >
        {storefrontAssociations.map((association) => (
          <option key={association} value={association}>
            {association}
          </option>
        ))}
      </select>
      ;
    </div>
  );
}
