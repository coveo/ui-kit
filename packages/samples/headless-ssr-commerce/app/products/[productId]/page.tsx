import ProductPage from '@/app/_components/pages/product-page';
import {searchEngineDefinition} from '@/app/_lib/commerce-engine';
import {NextJsNavigatorContext} from '@/app/_lib/navigatorContextProvider';
import {headers} from 'next/headers';
import {Suspense} from 'react';

export default async function ProductDescriptionPage({
  params,
}: {
  params: {productId: string};
}) {
  // Sets the navigator context provider to use the newly created `navigatorContext` before fetching the app static state
  const navigatorContext = new NextJsNavigatorContext(headers());
  searchEngineDefinition.setNavigatorContextProvider(() => navigatorContext);

  // Fetches the static state of the app with initial state (when applicable)
  const staticState = await searchEngineDefinition.fetchStaticState();
  return (
    <>
      <h2>Product description page</h2>
      <Suspense fallback={<p>Loading...</p>}>
        <ProductPage
          staticState={staticState}
          navigatorContext={navigatorContext.marshal}
          productId={params.productId}
        />
      </Suspense>
    </>
  );
}

export const dynamic = 'force-dynamic';
