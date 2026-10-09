import {useSurfaceReadOnly} from '../surface-read-only.js';
import styles from './FacetSearchMoreMatches.module.css';

/**
 * Text button rendered under facet search results when more matches can be requested. Mirrors
 * Atomic's `more-matches` control (`facet-search-matches.ts`) and is shared by every facet type.
 */
export function FacetSearchMoreMatches({
  query,
  testId,
  onShowMore,
}: {
  query: string;
  testId: string;
  onShowMore: () => void;
}) {
  const readOnly = useSurfaceReadOnly();
  return (
    <button
      type="button"
      className={styles.button}
      data-testid={testId}
      onClick={onShowMore}
      disabled={readOnly}
    >
      More matches for <span className={styles.query}>{query}</span>
    </button>
  );
}
