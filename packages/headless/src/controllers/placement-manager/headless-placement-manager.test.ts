// eslint-disable-next-line node/no-extraneous-import
import {placementSetReducer} from '../../features/placement-set/placement-set-slice';
import {
  buildMockCommercePlacementsEngine,
  MockCommercePlacementsEngine,
} from '../../test/mock-engine';
import {
  PlacementManagerOptions,
  buildPlacementManager,
} from './headless-placement-manager';
import {PlacementManager} from './headless-placement-manager';

describe('PlacementManager', () => {
  let engine: MockCommercePlacementsEngine;
  let options: PlacementManagerOptions;
  let placementManager: PlacementManager;

  function initPlacementManager() {
    placementManager = buildPlacementManager(engine, {options});
  }

  beforeEach(() => {
    engine = buildMockCommercePlacementsEngine();
    options = {
      currency: 'USD',
      locale: 'en-us',
    };

    initPlacementManager();
  });

  it('initializes', () => {
    expect(placementManager).toBeTruthy();
  });

  it('adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenNthCalledWith(1, {
      placementSetReducer,
    });
  });

  it('exposes a subscribe method', () => {
    expect(placementManager.subscribe).toBeTruthy();
  });
});
