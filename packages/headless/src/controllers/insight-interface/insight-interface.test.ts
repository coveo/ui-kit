import {configuration} from '../../app/common-reducers.js';
import {insightConfigurationReducer as insightConfiguration} from '../../features/insight-configuration/insight-configuration-slice.js';
import {insightInterfaceReducer as insightInterface} from '../../features/insight-interface/insight-interface-slice.js';
import {searchHubReducer as searchHub} from '../../features/search-hub/search-hub-slice.js';
import {
  buildMockInsightEngine,
  MockInsightEngine,
} from '../../test/mock-engine.js';
import {buildInsightInterface, InsightInterface} from './insight-interface.js';

describe('Insight Interface', () => {
  let engine: MockInsightEngine;
  let controller: InsightInterface;

  function initInsightInterface() {
    controller = buildInsightInterface(engine);
  }

  beforeEach(() => {
    engine = buildMockInsightEngine();
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

      expect(engine.actions).toContainEqual(
        expect.objectContaining({
          type: 'insight/interface/fetch/pending',
        })
      );
    });
  });
});
