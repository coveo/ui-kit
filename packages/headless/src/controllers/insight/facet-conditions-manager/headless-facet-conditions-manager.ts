import {InsightEngine} from '../../../app/insight-engine/insight-engine.js';
import {
  FacetConditionsManager,
  AnyFacetValuesCondition,
  FacetConditionsManagerProps,
  buildCoreFacetConditionsManager,
} from '../../core/facets/facet-conditions-manager/headless-facet-conditions-manager.js';

export type {
  FacetConditionsManager,
  FacetConditionsManagerProps,
  AnyFacetValuesCondition,
};

/**
 * Creates an insight `FacetConditionsManager` instance.
 *
 * @param engine - The insight engine.
 * @param props - The configurable `FacetConditionsManager` properties.
 * @returns A `FacetConditionsManager` controller instance.
 */
export function buildFacetConditionsManager(
  engine: InsightEngine,
  props: FacetConditionsManagerProps
) {
  return buildCoreFacetConditionsManager(engine, props);
}
