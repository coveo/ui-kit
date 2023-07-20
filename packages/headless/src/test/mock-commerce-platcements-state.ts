import {getConfigurationInitialState} from '../features/configuration/configuration-state';
import {getPlacementSetInitialState} from '../features/placement-set/placement-set-state';
import {CommercePlacementsAppState} from '../state/commerce-placements-state';

export function buildMockCommercePlacementsState(
  config: Partial<CommercePlacementsAppState> = {}
): CommercePlacementsAppState {
  return {
    configuration: getConfigurationInitialState(),
    placement: getPlacementSetInitialState(),
    version: 'unit-testing-version',
    ...config,
  };
}
