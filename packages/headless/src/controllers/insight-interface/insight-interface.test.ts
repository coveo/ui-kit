import {configuration} from '../../app/common-reducers';
import {insightConfigurationReducer as insightConfiguration} from '../../features/insight-configuration/insight-configuration-slice';
import {fetchInterface} from '../../features/insight-interface/insight-interface-actions';
import {insightInterfaceReducer as insightInterface} from '../../features/insight-interface/insight-interface-slice';
import {searchHubReducer as searchHub} from '../../features/search-hub/search-hub-slice';
import {
  buildMockInsightEngine,
  MockedInsightEngine,
} from '../../test/mock-engine-v2';
import {buildMockInsightState} from '../../test/mock-insight-state';
import {buildInsightInterface, InsightInterface} from './insight-interface';

jest.mock('../../features/insight-interface/insight-interface-actions');

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
