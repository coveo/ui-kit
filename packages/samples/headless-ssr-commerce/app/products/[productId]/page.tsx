import ProductProvider from '@/components/providers/product-provider';
import {Recommendations} from '@/components/recommendation-list';
import {standaloneEngineDefinition} from '@/lib/commerce-engine';
import {NextJsNavigatorContext} from '@/lib/navigatorContextProvider';
import {headers} from 'next/headers';
import {Suspense} from 'react';

export default async function ProductDescriptionPage({
  params,
}: {
  params: {productId: string};
}) {
  // Sets the navigator context provider to use the newly created `navigatorContext` before fetching the app static state
  const navigatorContext = new NextJsNavigatorContext(headers());
  standaloneEngineDefinition.setNavigatorContextProvider(
    () => navigatorContext
  );

  // Fetches the static state of the app with initial state (when applicable)
  const staticState = await standaloneEngineDefinition.fetchStaticState({
    controllers: {parameterManager: {initialState: {parameters: {}}}},
  });
  return (
    <>
      <h2>Product description page</h2>
      <Suspense fallback={<p>Loading...</p>}>
        <ProductProvider
          staticState={staticState}
          navigatorContext={navigatorContext.marshal}
          productId={params.productId}
        >
          <Recommendations />
        </ProductProvider>
      </Suspense>
    </>
  );
}

export const fetchCache = 'force-no-store';
export const dynamic = 'force-dynamic';
