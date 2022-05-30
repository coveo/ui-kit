import {
  configuration,
  insightConfiguration,
  insightInterface,
  searchHub,
} from '../../app/reducers';
import {
  buildMockInsightEngine,
  MockInsightEngine,
} from '../../test/mock-engine';
import {buildInsightInterface, InsightInterface} from './insight-interface';

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
