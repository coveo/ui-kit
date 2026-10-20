import {useCallback, useLayoutEffect, useRef, useSyncExternalStore} from 'react';
import {A2UIProvider, A2UIRenderer, Catalog, useA2UI} from '@copilotkit/a2ui-renderer';
import {SEARCH_BOX_SURFACE_ID, THERMIDOR_CATALOG_ID} from '@coveo/thermidor-schema/zod3';
import {useSession} from '../../context/session.js';
import {QuerySuggestions} from '../../a2ui/QuerySuggestions/QuerySuggestions.js';
import {SearchBoxOptionsContext, type SearchBoxOptions} from './search-box-options.js';

const catalog = new Catalog(THERMIDOR_CATALOG_ID, [QuerySuggestions]);

/**
 * PROTOTYPE (KIT-6367): draws the well-known search box surface. It has its own renderer, fed only
 * the well-known surfaces' messages, so the conversation's stream never clears or replays it, and
 * its actions go straight to the session.
 */
export function SearchBox(options: SearchBoxOptions) {
  const session = useSession();
  return (
    <SearchBoxOptionsContext.Provider value={options}>
      <A2UIProvider catalog={catalog} onAction={session.dispatchAction}>
        <WellKnownSurfaceFeed />
        <A2UIRenderer surfaceId={SEARCH_BOX_SURFACE_ID} />
      </A2UIProvider>
    </SearchBoxOptionsContext.Provider>
  );
}

/**
 * Hands the renderer each new well-known surface message once. A layout effect, so the surface is
 * created before the first paint.
 */
function WellKnownSurfaceFeed() {
  const session = useSession();
  const subscribe = useCallback(
    (onStoreChange: () => void) => session.subscribe(onStoreChange),
    [session]
  );
  const getMessages = useCallback(() => session.wellKnownSurfaceMessages, [session]);
  const messages = useSyncExternalStore(subscribe, getMessages, getMessages);
  const {processMessages} = useA2UI();
  const processedRef = useRef(0);

  useLayoutEffect(() => {
    if (messages.length > processedRef.current) {
      processMessages(
        messages.slice(processedRef.current) as Parameters<typeof processMessages>[0]
      );
      processedRef.current = messages.length;
    }
  }, [messages, processMessages]);

  return null;
}
