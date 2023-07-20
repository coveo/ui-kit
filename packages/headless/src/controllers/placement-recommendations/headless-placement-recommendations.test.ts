import {getRecs} from '../../features/placement-set/placement-set-action';
import {
  buildMockCommercePlacementsEngine,
  MockCommercePlacementsEngine,
} from '../../test/mock-engine';
import {
  PlacementRecommendations,
  buildPlacementRecommendations,
} from './headless-placement-recommendations';

describe('PlacementRecommendations', () => {
  let engine: MockCommercePlacementsEngine;
  let placementRecommendations: PlacementRecommendations;

  function initPlacementRecommendations() {
    placementRecommendations = buildPlacementRecommendations(engine, {
      options: {placementId: '123'},
    });
  }

  beforeEach(() => {
    engine = buildMockCommercePlacementsEngine();
    initPlacementRecommendations();
  });

  it('initializes', () => {
    expect(placementRecommendations).toBeTruthy();
  });

  it('refresh dispatches #getRecs', () => {
    placementRecommendations.refresh();
    expect(engine.findAsyncAction(getRecs.pending)).toBeDefined();
  });
});
