import {useId, useLayoutEffect, useState} from 'react';
import {A2UIProvider, A2UIRenderer, Catalog, useA2UI} from '@copilotkit/a2ui-renderer';
import type {WellKnownSurface, WellKnownSurfaceTemplate} from '@coveo/thermidor';
import {SearchBoxSurface, THERMIDOR_CATALOG_ID} from '@coveo/thermidor-schema/zod3';
import {useSession} from '../../context/session.js';
import {QuerySuggestions} from '../../a2ui/QuerySuggestions/QuerySuggestions.js';
import {SearchBoxOptionsContext, type SearchBoxOptions} from './search-box-options.js';

const catalog = new Catalog(THERMIDOR_CATALOG_ID, [QuerySuggestions]);

/**
 * PROTOTYPE (KIT-6367): draws an instance of the well-known search box surface. It has its own
 * renderer, fed only that instance's messages, so the conversation's stream never clears or
 * replays it, and its actions go straight to the session.
 */
export function SearchBox(options: SearchBoxOptions) {
  const session = useSession();
  return (
    <SearchBoxOptionsContext.Provider value={options}>
      <A2UIProvider catalog={catalog} onAction={session.dispatchAction}>
        <WellKnownSurfaceRenderer template={SearchBoxSurface} />
      </A2UIProvider>
    </SearchBoxOptionsContext.Provider>
  );
}

function WellKnownSurfaceRenderer({template}: {template: WellKnownSurfaceTemplate}) {
  const surface = useWellKnownSurface(template);
  return surface ? <A2UIRenderer surfaceId={surface.surfaceId} /> : null;
}

/**
 * Creates an instance of the template for as long as the component is mounted, and hands the
 * renderer each of its messages once. A layout effect, so the surface is drawn on first paint.
 */
function useWellKnownSurface(template: WellKnownSurfaceTemplate): WellKnownSurface | null {
  const session = useSession();
  const {processMessages} = useA2UI();
  const id = useId();
  const [surface, setSurface] = useState<WellKnownSurface | null>(null);

  useLayoutEffect(() => {
    const created = session.createWellKnownSurface(template, {
      surfaceId: `${template.template}${id}`,
    });
    let processed = 0;
    const feed = () => {
      if (created.messages.length > processed) {
        processMessages(created.messages.slice(processed) as Parameters<typeof processMessages>[0]);
        processed = created.messages.length;
      }
    };
    feed();
    const unsubscribe = session.subscribe(feed);
    setSurface(created);
    return () => {
      unsubscribe();
      created.dispose();
      processMessages([{version: 'v0.9', deleteSurface: {surfaceId: created.surfaceId}}]);
    };
  }, [session, template, id, processMessages]);

  return surface;
}
