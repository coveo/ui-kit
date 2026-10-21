import {A2UIProvider, A2UIRenderer, Catalog} from '@copilotkit/a2ui-renderer';
import {SearchBoxSurfaceTemplate, THERMIDOR_CATALOG_ID} from '@coveo/thermidor-schema/zod3';
import {useSession} from '../../context/session.js';
import {useSurfaceInstance} from '../../hooks/use-surface-instance.js';
import {QuerySuggestions} from '../../a2ui/QuerySuggestions/QuerySuggestions.js';
import {SearchBoxOptionsContext, type SearchBoxOptions} from './search-box-options.js';

const catalog = new Catalog(THERMIDOR_CATALOG_ID, [QuerySuggestions]);

/**
 * Draws an instance of the search box surface template. It has a renderer of its own, so the
 * conversation's stream never clears or replays it, and its lookups go straight to the session.
 */
export function SearchBox(options: SearchBoxOptions) {
  const session = useSession();
  return (
    <SearchBoxOptionsContext.Provider value={options}>
      <A2UIProvider catalog={catalog} onAction={session.dispatchAction}>
        <SearchBoxSurfaceRenderer />
      </A2UIProvider>
    </SearchBoxOptionsContext.Provider>
  );
}

function SearchBoxSurfaceRenderer() {
  const surfaceId = useSurfaceInstance(SearchBoxSurfaceTemplate);
  return surfaceId ? <A2UIRenderer surfaceId={surfaceId} /> : null;
}
