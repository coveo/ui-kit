/* eslint-disable @cspell/spellchecker */
import {buildCommercePlacementEngine} from '../app/commerce-placement-engine/commerce-placement-engine';
import {
  getBadge,
  getRecs,
} from '../features/placement-set/placement-set-action';
import {getOrganizationEndpoints} from '../recommendation.index';

describe('commerce placements', () => {
  it('should allow to query without errors', async () => {
    const engine = buildCommercePlacementEngine({
      configuration: {
        // random min privileges key in dev
        accessToken: 'xxa0ccd787-ba54-40fb-89ff-f393356448c4',
        // random test org in dev
        organizationId: 'aduiorgtestdonotdeletepleaseas62tcf4',
        organizationEndpoints: getOrganizationEndpoints(
          'aduiorgtestdonotdeletepleaseas62tcf4',
          'dev'
        ),
      },
    });

    await engine.dispatch(
      getBadge({
        placementId: '5GKB9hFRTnmC24QxZTlDoA',
        implementationId: 'CB8mj48FSaC8iWMFTZYJgg',
        seeds: [{ids: ['SP00553_00002'], src: 'pdp'}],
      })
    );

    await engine.dispatch(
      getRecs({
        placementId: 'ZYFiN7m7S1aCvW3nnaXwRg',
        implementationId: 'VeZqj8cVRyiPxQP1uEQJ4Q',
        seeds: [{ids: ['SP00421_00004'], src: 'cart'}],
      })
    );

    Object.values(engine.state.placement.badges).forEach((badge) => {
      expect(badge.error).toBeUndefined();
    });

    Object.values(engine.state.placement.recs).forEach((recommendation) => {
      expect(recommendation.error).toBeUndefined();
    });
  });
});
