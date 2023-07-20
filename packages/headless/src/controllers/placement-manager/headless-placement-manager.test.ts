import {Action} from 'redux';
import {
  setCartSkus,
  setOrderSkus,
  setPlpSkus,
  setProductSku,
  setRecsSkus,
  setSearchSkus,
  setView,
} from '../../features/placement-set/placement-set-action';
import {
  buildMockCommercePlacementsEngine,
  MockCommercePlacementsEngine,
} from '../../test/mock-engine';
import {buildPlacementManager} from './headless-placement-manager';
import {PlacementManager} from './headless-placement-manager';

describe('PlacementManager', () => {
  const expectContainAction = (action: Action) => {
    const found = engine.actions.find((a) => a.type === action.type);
    expect(engine.actions).toContainEqual(found);
  };

  let engine: MockCommercePlacementsEngine;
  let placementManager: PlacementManager;

  function initPlacementManager() {
    placementManager = buildPlacementManager(engine, {
      options: {
        view: {
          currency: 'USD',
          locale: 'en-us',
          type: 'category',
        },
      },
    });
  }

  beforeEach(() => {
    engine = buildMockCommercePlacementsEngine();
    initPlacementManager();
  });

  it('initializes', () => {
    expect(placementManager).toBeTruthy();
  });

  it('setCartSkus dispatches #setCartSkus', () => {
    placementManager.setCartSkus(['my-sku']);
    expectContainAction(setCartSkus);
  });

  it('setOrderSkus dispatches #setOrderSkus', () => {
    placementManager.setOrderSkus(['my-sku']);
    expectContainAction(setOrderSkus);
  });

  it('setPlpSkus dispatches #setPlpSkus', () => {
    placementManager.setPlpSkus(['my-sku']);
    expectContainAction(setPlpSkus);
  });

  it('setProductSku dispatches #setProductSku', () => {
    placementManager.setProductSku('my-sku');
    expectContainAction(setProductSku);
  });

  it('setRecsSkus dispatches #setRecsSkus', () => {
    placementManager.setRecsSkus(['my-sku']);
    expectContainAction(setRecsSkus);
  });

  it('setSearchSkus dispatches #setSearchSkus', () => {
    placementManager.setSearchSkus(['my-sku']);
    expectContainAction(setSearchSkus);
  });

  it('setLocale dispatches #setLocale', () => {
    placementManager.setLocale('CAD', 'fr-ca');
    expectContainAction(setView);
  });

  it('setView dispatches #setView', () => {
    placementManager.setView('product');
    expectContainAction(setView);
  });
});
