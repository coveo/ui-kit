import {useEffect, useRef} from 'react';
import {
  buildBackendUrlManagerController,
  deserializeFragment,
  type BackendUrlManagerController,
} from '@coveo/thermidor';
import {converseController, generativeInterface} from '../generative-setup.js';

const SESSION_TOKEN_KEY_PREFIX = 'coveo-ct-';

export function useSessionTokenPersistence() {
  useEffect(() => {
    return converseController.subscribe(() => {
      const {conversationSessionId, conversationToken} =
        converseController.state;
      if (conversationSessionId && conversationToken) {
        sessionStorage.setItem(
          `${SESSION_TOKEN_KEY_PREFIX}${conversationSessionId}`,
          conversationToken
        );
      }
    });
  }, []);
}

/**
 * On initial page load, if the URL has state params (q=, csid=, etc.),
 * restore the session and send a restore_state action to bootstrap the interface.
 * This runs once before any interface exists.
 */
export function useInitialUrlRestore() {
  useEffect(() => {
    const fragment = window.location.search.slice(1);
    if (!fragment || !fragment.includes('q=')) return;

    const parsed = deserializeFragment(fragment);
    if (!parsed.query) return;

    if (parsed.csid) {
      const storedToken = sessionStorage.getItem(
        `${SESSION_TOKEN_KEY_PREFIX}${parsed.csid}`
      );
      if (storedToken) {
        converseController.restoreSession(parsed.csid, storedToken);
      }
    }

    const interfaceId = parsed.interfaceId ?? 'ui-1';

    converseController.sendAction({
      type: 'restore_state',
      interfaceId,
      query: parsed.query,
      facets: parsed.facets?.map((f) => ({
        facetId: f.facetId,
        values: f.values,
      })),
      page: parsed.page ?? 0,
      sort: parsed.sort,
    });
  }, []);
}

/**
 * Once an interface exists, manage ongoing URL ↔ state synchronization
 * (pushState on state change, popstate → restore_state).
 */
export function useUrlManager(interfaceId: string | undefined) {
  const controllerRef = useRef<BackendUrlManagerController | null>(null);
  const firstPushDone = useRef(false);

  useEffect(() => {
    if (!interfaceId) return;

    const controller = buildBackendUrlManagerController({
      interface: generativeInterface,
      converseController,
      interfaceId,
    });

    controllerRef.current = controller;

    const unsub = controller.subscribe(() => {
      const {fragment} = controller.state;
      const url = fragment ? `?${fragment}` : window.location.pathname;

      if (!firstPushDone.current) {
        history.replaceState(null, '', url);
        firstPushDone.current = true;
      } else {
        history.pushState(null, '', url);
      }
    });

    // Eagerly sync the URL if the interface already has state (created before subscribe)
    const initialState = controller.state;
    if (initialState.fragment) {
      const url = `?${initialState.fragment}`;
      history.replaceState(null, '', url);
      firstPushDone.current = true;
    }

    const onPopState = () => {
      const fragment = window.location.search.slice(1);
      controller.synchronize(fragment);
    };

    window.addEventListener('popstate', onPopState);

    return () => {
      unsub();
      window.removeEventListener('popstate', onPopState);
      controllerRef.current = null;
    };
  }, [interfaceId]);
}
