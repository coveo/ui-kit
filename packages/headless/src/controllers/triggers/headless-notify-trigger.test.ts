import {
  buildMockSearchEngine,
  MockedSearchEngine,
} from '../../test/mock-engine-v2';
import {createMockState} from '../../test/mock-state';
import {NotifyTrigger} from '../core/triggers/headless-core-notify-trigger';
import {buildNotifyTrigger} from './headless-notify-trigger';

jest.mock('../../features/triggers/trigger-analytics-actions');

describe('NotifyTrigger', () => {
  let engine: MockedSearchEngine;
  let notifyTrigger: NotifyTrigger;

  function initNotifyTrigger() {
    notifyTrigger = buildNotifyTrigger(engine);
  }

  beforeEach(() => {
    jest.resetAllMocks();
    engine = buildMockSearchEngine(createMockState());
    initNotifyTrigger();
  });

  it('initializes', () => {
    expect(notifyTrigger).toBeTruthy();
  });

  it('exposes a #subscribe method', () => {
    expect(notifyTrigger.subscribe).toBeTruthy();
  });
});
