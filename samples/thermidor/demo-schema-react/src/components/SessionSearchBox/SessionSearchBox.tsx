import {useSyncExternalStore} from 'react';
import {A2UIRenderer} from '@copilotkit/a2ui-renderer';
import {useSession} from '../../context/session.js';
import {
  SearchBoxOptionsContext,
  type SearchBoxOptions,
} from '../../a2ui/SearchBox/search-box-context.js';
import {PromptInput} from '../PromptInput/PromptInput.js';

/**
 * The search box of the session shell, the surface the producer creates when the session opens.
 * While the session opens, a disabled input of the same shape stands in its place, so the page does
 * not shift; once it has opened without a shell, or failed to, a plain input without suggestions
 * does.
 */
export function SessionSearchBox(options: SearchBoxOptions) {
  const session = useSession();
  const {surfaces, initialization} = useSyncExternalStore(
    session.subscribe,
    session.getSnapshot,
    session.getSnapshot
  );
  const shellId = surfaces.find(
    ({rootComponentType}) => rootComponentType === 'SessionShell'
  )?.surfaceId;
  const initializing = initialization?.status === 'streaming';

  const {onSubmit, busy, placeholder, clearOnSubmit} = options;
  const placeholderInput = <PromptInput onSubmit={onSubmit} disabled placeholder={placeholder} />;

  if (shellId !== undefined) {
    return (
      <SearchBoxOptionsContext.Provider value={options}>
        <A2UIRenderer surfaceId={shellId} fallback={placeholderInput} />
      </SearchBoxOptionsContext.Provider>
    );
  }
  if (!initializing) {
    return (
      <PromptInput
        onSubmit={onSubmit}
        busy={busy}
        placeholder={placeholder}
        clearOnSubmit={clearOnSubmit}
      />
    );
  }
  return placeholderInput;
}
