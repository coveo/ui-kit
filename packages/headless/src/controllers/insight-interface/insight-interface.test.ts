import {configuration} from '../../app/common-reducers.js';
import {insightConfigurationReducer as insightConfiguration} from '../../features/insight-configuration/insight-configuration-slice.js';
import {fetchInterface} from '../../features/insight-interface/insight-interface-actions.js';
import {insightInterfaceReducer as insightInterface} from '../../features/insight-interface/insight-interface-slice.js';
import {searchHubReducer as searchHub} from '../../features/search-hub/search-hub-slice.js';
import {
  buildMockInsightEngine,
  type MockedInsightEngine,
} from '../../test/mock-engine-v2.js';
import {buildMockInsightState} from '../../test/mock-insight-state.js';
import {
  buildInsightInterface,
  type InsightInterface,
} from './insight-interface.js';

vi.mock('../../features/insight-interface/insight-interface-actions');

describe('Insight Interface', () => {
  let engine: MockedInsightEngine;
  let controller: InsightInterface;

  function initInsightInterface() {
    controller = buildInsightInterface(engine);
  }

  beforeEach(() => {
    engine = buildMockInsightEngine(buildMockInsightState());
    initInsightInterface();
  });

  it('adds the correct reducers to the engine', () => {
    expect(engine.addReducers).toBeCalledWith({
      configuration,
      insightConfiguration,
      insightInterface,
      searchHub,
    });
  });

  describe('#fetch', () => {
    it('should dispatch a #fetchInterface action', () => {
      controller.fetch();
      expect(fetchInterface).toHaveBeenCalled();
    });
  });
});
