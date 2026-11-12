import Link from 'next/link';
import {HydrationIndicator} from '@/components/react/hydration-metadata';
import {StandaloneProvider} from '@/components/react/providers';
import StandaloneSearchBox from '@/components/react/standalone-search-box';
import {getNavigatorContext} from '@/lib/navigator-context';
import {standaloneEngineDefinition} from '@/lib/react/engine';
import {contextValues} from '@/lib/search-engine-config';

/**
 * The home page runs no search on the server: its standalone search box sends the visitor to the
 * React search page.
 */
export default async function Home() {
  const staticState = await standaloneEngineDefinition.fetchStaticState({
    navigatorContext: await getNavigatorContext(),
    controllers: {context: {initialState: {values: contextValues}}},
  });

  return (
    <>
      <StandaloneProvider staticState={staticState}>
        <StandaloneSearchBox />
        <HydrationIndicator />
      </StandaloneProvider>
      <ul>
        <li>
          <Link href="/generic">Framework-agnostic example</Link>
        </li>
        <li>
          <Link href="/react">React example</Link>
        </li>
      </ul>
    </>
  );
}

export const dynamic = 'force-dynamic';
