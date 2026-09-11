import {useCallback, useMemo, useSyncExternalStore} from 'react';
import type {Activity} from '@coveo/thermidor';
import {ProductTargeting} from '../ProductTargeting/ProductTargeting.js';
import {type TargetedProduct} from '../../context/targeting.js';
import {getA2UIMessages, ThermidorA2UISurfaces} from '../../a2ui/surfaces.js';
import {useStateSource} from '../../a2ui/state-source-context.js';
import styles from './SearchResultsPage.module.css';

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
 * A2-UI activities and hands them to `ThermidorA2UISurfaces`.
 *
 * Navigation to this page is derived directly from the A2-UI activities
 * (a createSurface whose root component's componentType is 'commerce-search').
 */
export function SearchResultsPage(props: SearchResultsPageProps) {
  const stateSource = useStateSource();
  const subscribe = useCallback(
    (onStoreChange: () => void) => stateSource.subscribe(onStoreChange),
    [stateSource]
  );
  const getActivities = useCallback(
    (): Activity[] | undefined =>
      (stateSource.state as {activeTurn?: {agentResponse?: {activities?: Activity[]}}}).activeTurn
        ?.agentResponse?.activities,
    [stateSource]
  );
  const activities = useSyncExternalStore(subscribe, getActivities, getActivities);

  const a2uiMessages = useMemo(() => getA2UIMessages(activities), [activities]);

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
