import {
  type CommerceEngine,
  type ContextOptions,
  loadProductListingActions,
  loadSearchActions,
} from '@coveo/headless-react/ssr-commerce';
import {useState} from 'react';
import type {LoaderFunctionArgs} from 'react-router';
import {Form, useFetcher, useLoaderData} from 'react-router';
import externalContextService from '@/external-services/external-context-service';
import {useContext, useEngine} from '@/lib/commerce-engine';

export const loader = async (_args: LoaderFunctionArgs) => {
  const contextInfo = await externalContextService.getContextInformation();
  return contextInfo;
};

export default function ContextDropdown({
  useCase,
}: {
  useCase?: 'listing' | 'search';
}) {
  const {state, methods} = useContext();
  const engine = useEngine();
  const fetcher = useFetcher();
  const serverContext = useLoaderData<typeof loader>();
  const [, setContext] = useState<{
    language: string;
    country: string;
    currency: string;
  }>(serverContext);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [language, country, currency] = e.target.value.split('-');
    const newContext = {language, country, currency};
    setContext(newContext);
    methods?.setLanguage(language);
    methods?.setCountry(country);
    methods?.setCurrency(currency as ContextOptions['currency']);

    fetcher.submit(
      {language, country, currency},
      {method: 'post', action: '/context/update'}
    );

    if (useCase === 'search') {
      engine?.dispatch(
        loadSearchActions(engine as CommerceEngine).executeSearch()
      );
    } else if (useCase === 'listing') {
      engine?.dispatch(
        loadProductListingActions(
          engine as CommerceEngine
        ).fetchProductListing()
      );
    }
  };

  return (
    <div>
      Context dropdown:
      <Form method="post" action="/context/update">
        <select
          value={`${state.language}-${state.country}-${state.currency}`}
          onChange={handleChange}
        >
          {externalContextService.getContextOptions().map((association) => (
            <option key={association} value={association}>
              {association}
            </option>
          ))}
        </select>
      </Form>
    </div>
  );
}
