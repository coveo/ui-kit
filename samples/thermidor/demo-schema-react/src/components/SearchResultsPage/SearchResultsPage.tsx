import {useCallback, useSyncExternalStore} from 'react';
import type {A2uiV09Message} from '@coveo/thermidor';
import {ProductTargeting} from '../ProductTargeting/ProductTargeting.js';
import {type TargetedProduct} from '../../context/targeting.js';
import {ThermidorA2UISurfaces} from '../../a2ui/surfaces.js';
import {useSession} from '../../context/session.js';
import styles from './SearchResultsPage.module.css';

/** Stable empty snapshot: `useSyncExternalStore` requires a referentially stable read. */
const EMPTY_MESSAGES: A2uiV09Message[] = [];

interface SearchResultsPageProps {
  surfaceId: string;
  onSubmit: (prompt: string) => void;
  isStreaming: boolean;
  query?: string;
  onBackToConversation: () => void;
  products: TargetedProduct[];
  onProductsChange: (products: TargetedProduct[]) => void;
}

/**
 * Layout shell for a routed commerce search surface.
 *
 * Commerce search surfaces are decomposed into individual A2-UI components
 * (commerce-search root, search-box, facet-manager, sort, pagination, product-list)
 * mounted through the A2-UI renderer pipeline, exactly like every other surface. The
 * `commerce-search` root renderer owns the sidebar/main layout and mounts its children
 * by id from the composition on the A2-UI plane; this page only reads the active turn's
 * renderer-ready A2-UI message stream and hands it to `ThermidorA2UISurfaces`.
 *
 * Navigation to this page is derived directly from the A2-UI activities
 * (a createSurface whose root node's `component` discriminant is 'CommerceSearch').
 */
export function SearchResultsPage(props: SearchResultsPageProps) {
  const session = useSession();
  const subscribe = useCallback(
    (onStoreChange: () => void) => session.subscribe(onStoreChange),
    [session]
  );
  const getA2uiMessages = useCallback((): A2uiV09Message[] => {
    const turns = session.turns;
    return turns[turns.length - 1]?.response.a2uiMessages ?? EMPTY_MESSAGES;
  }, [session]);
  const a2uiMessages = useSyncExternalStore(subscribe, getA2uiMessages, getA2uiMessages);

  return (
    <div className={styles.searchLayout}>
      <ProductTargeting
        products={props.products}
        onProductsChange={props.onProductsChange}
        onSubmit={props.onSubmit}
        isStreaming={props.isStreaming}
        promptProps={{
          initialValue: props.query ?? '',
        }}
      >
        <ThermidorA2UISurfaces messages={a2uiMessages} />
      </ProductTargeting>
      <button
        type="button"
        className={styles.floatingBackButton}
        onClick={props.onBackToConversation}
        title="Back to conversation"
        aria-label="Back to conversation"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>
    </div>
  );
}
