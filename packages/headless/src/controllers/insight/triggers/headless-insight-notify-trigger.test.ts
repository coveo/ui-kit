import {
  buildMockInsightEngine,
  MockedInsightEngine,
} from '../../../test/mock-engine-v2';
import {buildMockInsightState} from '../../../test/mock-insight-state';
import {
  NotifyTrigger,
  buildNotifyTrigger,
} from './headless-insight-notify-trigger';

jest.mock('../../../features/insight-search/insight-search-actions');

describe('NotifyTrigger', () => {
  let engine: MockedInsightEngine;
  let notifyTrigger: NotifyTrigger;

  function initNotifyTrigger() {
    notifyTrigger = buildNotifyTrigger(engine);
  }

  beforeEach(() => {
    engine = buildMockInsightEngine(buildMockInsightState());
    initNotifyTrigger();
  });

  it('initializes', () => {
    expect(notifyTrigger).toBeTruthy();
  });

  it('exposes a #subscribe method', () => {
    expect(notifyTrigger.subscribe).toBeTruthy();
  });
});
