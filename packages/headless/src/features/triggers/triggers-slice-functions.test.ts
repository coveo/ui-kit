import type {Trigger} from '../../api/common/trigger.js';
import {buildMockExecuteTrigger} from '../../test/mock-trigger-execute.js';
import {buildMockNotifyTrigger} from '../../test/mock-trigger-notify.js';
import {buildMockQueryTrigger} from '../../test/mock-trigger-query.js';
import {buildMockRedirectTrigger} from '../../test/mock-trigger-redirect.js';
import {
  handleApplyQueryTriggerModification,
  handleFetchItemsFulfilled,
  handleFetchItemsPending,
  handleUpdateIgnoreQueryTrigger,
} from './triggers-slice-functions.js';
import {getTriggerInitialState, type TriggerState} from './triggers-state.js';

describe('triggers slice functions', () => {
  let state: TriggerState;
  let originalState: TriggerState;

  beforeEach(() => {
    state = {
      executions: [{functionName: 'functionName', params: ['param']}],
      notifications: ['notification'],
      redirectTo: 'redirect to',
      query: 'query',
      queryModification: {
        newQuery: 'query',
        originalQuery: 'query',
        queryToIgnore: 'query to ignore',
      },
    };
    originalState = JSON.parse(JSON.stringify(state)) as typeof state;
  });
  it('#handleFetchItemsPending resets #query, #queryModification.originalQuery, and #queryModification.newQuery', () => {
    handleFetchItemsPending(state);

    expect(state).toEqual({
      ...originalState,
      query: '',
      queryModification: {
        ...state.queryModification,
        originalQuery: '',
        newQuery: '',
      },
    });
  });

  describe('#handleFetchItemsFulfilled', () => {
    let mockExecuteTrigger: Trigger;
    let mockNotifyTrigger: Trigger;
    let mockRedirectTrigger: Trigger;
    let mockQueryTrigger: Trigger;

    beforeEach(() => {
      mockExecuteTrigger = buildMockExecuteTrigger({
        content: {
          name: originalState.executions[0].functionName,
          params: originalState.executions[0].params,
        },
      });
      mockNotifyTrigger = buildMockNotifyTrigger({
        content: originalState.notifications[0],
      });
      mockRedirectTrigger = buildMockRedirectTrigger({
        content: originalState.redirectTo,
      });
      mockQueryTrigger = buildMockQueryTrigger({content: originalState.query});
    });

    it('when action payload contains multiple redirect triggers, sets #redirectTo to first redirect trigger content', () => {
      const expectedRedirectTo = `new ${originalState.redirectTo}`;
      const triggers = [
        mockExecuteTrigger,
        mockNotifyTrigger,
        mockQueryTrigger,
        buildMockRedirectTrigger({content: expectedRedirectTo}),
        buildMockRedirectTrigger({content: originalState.redirectTo}),
      ];

      const finalState = handleFetchItemsFulfilled(state, triggers);

      expect(finalState).toEqual({
        ...originalState,
        redirectTo: expectedRedirectTo,
      });
    });

    it('when action payload contains no redirect triggers, sets #redirectTo to an empty string', () => {
      const triggers = [
        mockExecuteTrigger,
        mockNotifyTrigger,
        mockQueryTrigger,
      ];

      const finalState = handleFetchItemsFulfilled(state, triggers);

      expect(finalState).toEqual({...originalState, redirectTo: ''});
    });

    it('sets #query to #queryModification.newQuery', () => {
      const triggers = [
        mockExecuteTrigger,
        mockRedirectTrigger,
        mockNotifyTrigger,
        mockQueryTrigger,
      ];

      const latestNewQuery = `latest ${originalState.queryModification.newQuery}`;
      state.queryModification.newQuery = latestNewQuery;
      originalState = JSON.parse(JSON.stringify(state)) as typeof state;

      const finalState = handleFetchItemsFulfilled(state, triggers);

      expect(finalState).toEqual({...originalState, query: latestNewQuery});
    });

    it('sets #executions to trigger content of type "execute"', () => {
      const executeTriggers = [
        buildMockExecuteTrigger({
          content: {
            name: `new_${originalState.executions[0].functionName}1`,
            params: [`new ${originalState.executions[0].params[0]} 1`],
          },
        }),
        buildMockExecuteTrigger({
          content: {
            name: `new_${originalState.executions[0].functionName}2`,
            params: [`new ${originalState.executions[0].params[0]} 2`],
          },
        }),
      ];
      const triggers = [
        mockRedirectTrigger,
        mockNotifyTrigger,
        mockQueryTrigger,
        ...executeTriggers,
      ];

      const finalState = handleFetchItemsFulfilled(state, triggers);

      expect(finalState).toEqual({
        ...originalState,
        executions: executeTriggers.map((trigger) => ({
          functionName: trigger.content.name,
          params: trigger.content.params,
        })),
      });
    });

    it('sets #notifications to trigger content of type "notify"', () => {
      const notifyTriggers = [
        buildMockNotifyTrigger({
          content: `new ${originalState.notifications[0]} 1`,
        }),
        buildMockNotifyTrigger({
          content: `new ${originalState.notifications[0]} 2`,
        }),
      ];

      const triggers = [
        mockExecuteTrigger,
        mockRedirectTrigger,
        mockQueryTrigger,
        ...notifyTriggers,
      ];

      const finalState = handleFetchItemsFulfilled(state, triggers);

      expect(finalState).toEqual({
        ...originalState,
        notifications: notifyTriggers.map((trigger) => trigger.content),
      });
    });
  });

  it('#handleApplyQueryTriggerModification sets #queryModification to value from payload', () => {
    const originalState = getTriggerInitialState();
    const payload = {
      newQuery: 'new query',
      originalQuery: 'original query',
    };

    const finalState = handleApplyQueryTriggerModification(
      originalState,
      payload
    );

    expect(finalState).toEqual({
      ...originalState,
      queryModification: {...payload, queryToIgnore: ''},
    });
  });

  it('#handleUpdateIgnoreQueryTrigger', () => {
    const originalState = getTriggerInitialState();
    const payload = 'new query to ignore';

    const finalState = handleUpdateIgnoreQueryTrigger(originalState, payload);

    expect(finalState).toEqual({
      ...originalState,
      queryModification: {
        ...originalState.queryModification,
        queryToIgnore: payload,
      },
    });
  });
});
