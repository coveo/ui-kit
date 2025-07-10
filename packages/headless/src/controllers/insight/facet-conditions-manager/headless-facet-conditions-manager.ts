import type {InsightEngine} from '../../../app/insight-engine/insight-engine.js';
import {
  type AnyFacetValuesCondition,
  buildCoreFacetConditionsManager,
  type FacetConditionsManager,
  type FacetConditionsManagerProps,
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
 *
 * @group Controllers
 * @category FacetConditionsManager
 */
export function buildFacetConditionsManager(
  engine: InsightEngine,
  props: FacetConditionsManagerProps
) {
  return buildCoreFacetConditionsManager(engine, props);
}
