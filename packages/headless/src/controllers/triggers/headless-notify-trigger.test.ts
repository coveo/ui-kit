import {
  buildMockSearchEngine,
  type MockedSearchEngine,
} from '../../test/mock-engine-v2.js';
import {createMockState} from '../../test/mock-state.js';
import type {NotifyTrigger} from '../core/triggers/headless-core-notify-trigger.js';
import {buildNotifyTrigger} from './headless-notify-trigger.js';

vi.mock('../../features/triggers/trigger-analytics-actions');

describe('NotifyTrigger', () => {
  let engine: MockedSearchEngine;
  let notifyTrigger: NotifyTrigger;

  function initNotifyTrigger() {
    notifyTrigger = buildNotifyTrigger(engine);
  }

  beforeEach(() => {
    vi.resetAllMocks();
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
