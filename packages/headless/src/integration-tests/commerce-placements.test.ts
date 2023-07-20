/* eslint-disable @cspell/spellchecker */
import {buildCommercePlacementEngine} from '../app/commerce-placement-engine/commerce-placement-engine';
import {
  getBadge,
  getRecs,
  setLocale,
  setProductSku,
  setView,
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

    engine.dispatch(setProductSku('SP00553_00002'));
    engine.dispatch(setLocale({currency: 'USD', locale: 'en-us'}));
    engine.dispatch(setView({type: 'product', subtype: []}));
    await engine.dispatch(
      getBadge({
        placementId: '5GKB9hFRTnmC24QxZTlDoA',
      })
    );

    await engine.dispatch(
      getRecs({
        placementId: 'vOMMwnUJQ6WUoIVFYIgH5w',
      })
    );

    Object.values(engine.state.placement.badges).forEach((badge) => {
      expect(badge.error).toBeUndefined();
    });

    Object.values(engine.state.placement.recommendations).forEach(
      (recommendation) => {
        expect(recommendation.error).toBeUndefined();
      }
    );
  });
});
