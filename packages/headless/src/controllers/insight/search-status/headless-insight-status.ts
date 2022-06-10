import {InsightEngine} from '../../../app/insight-engine/insight-engine';
import {Controller} from '../../controller/headless-controller';
import {
  CoreStatusState,
  buildCoreStatus,
} from '../../core/status/headless-core-status';

/**
 * The `InsightStatus` controller provides information on the status of the search.
 */
export interface InsightStatus extends Controller {
  state: InsightStatusState;
}

/**
 * A scoped and simplified part of the headless state that is relevant to the `InsightStatus` controller.
 */
export interface InsightStatusState extends CoreStatusState {}

/**
 * Creates a `InsightStatus` controller instance.
 *
 * @param engine - The headless engine.
 * @returns A `InsightStatus` controller instance.
 */
export function buildInsightStatus(engine: InsightEngine): InsightStatus {
  return buildCoreStatus(engine);
}
