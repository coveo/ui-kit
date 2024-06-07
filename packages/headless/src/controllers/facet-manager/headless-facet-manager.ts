import {SearchEngine} from '../../app/search-engine/search-engine';
import {
  breadcrumbResetAll,
  logClearBreadcrumbs,
} from '../../features/facets/generic/facet-generic-analytics-actions';
import {executeSearch} from '../../features/search/search-actions';
import {
  buildCoreFacetManager,
  FacetManager,
  FacetManagerState,
  FacetManagerPayload,
} from '../core/facet-manager/headless-core-facet-manager';

export type {FacetManagerState, FacetManagerPayload, FacetManager};

/**
 * Creates a `FacetManager` instance.
 *
 * @param engine - The headless engine.
 */
export function buildFacetManager(engine: SearchEngine): FacetManager {
  const controller = buildCoreFacetManager(engine);
  const {dispatch} = engine;

  return {
    ...controller,

    deselectAll: () => {
      controller.deselectAll();
      dispatch(
        executeSearch({
          legacy: logClearBreadcrumbs(),
          next: breadcrumbResetAll(),
        })
      );
    },
  };
}
