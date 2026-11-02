import {FacetSearchOffered} from '../../a2ui/facet-search-offered.js';
import type {ScopingSurface} from '../../a2ui/surface-stream.js';
import {SurfaceGroup} from '../../a2ui/surfaces.js';
import styles from './ScopingPanel.module.css';

interface ScopingPanelProps {
  scoping: ScopingSurface;
  /** Whether the Scoping block belongs to the latest turn, the only one whose blocks take actions. */
  interactive: boolean;
  isStreaming: boolean;
}

/**
 * The Selection that scopes every question, drawn once beside the conversation so it stays in view
 * for the whole thread. Until the latest turn draws its own Scoping block, the previous one stays
 * readable: the Selection it shows still applies. The gateway answers no facet search in it, so its
 * Facets draw no search field.
 */
export function ScopingPanel({scoping, interactive, isStreaming}: ScopingPanelProps) {
  return (
    <aside className={styles.panel} aria-label="Scope">
      <FacetSearchOffered value={false}>
        <SurfaceGroup
          surfaceIds={[scoping.surfaceId]}
          interactive={interactive}
          isStreaming={isStreaming}
          readOnlyNote="Still applied to your questions."
        />
      </FacetSearchOffered>
    </aside>
  );
}
