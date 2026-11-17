import {afterEach, describe, expect, it, vi} from 'vitest';
import {cleanup, render} from '@testing-library/react';
import type {A2uiClientMessage, SessionRequest} from '@coveo/thermidor';
import {
  StorefrontSessionProvider,
  useStorefrontSend,
  useTurnViews,
  type TurnViews,
} from './storefront-session.js';

/** The request each dispatch publishes, in order; `undefined` withholds it. */
const fakeSession = vi.hoisted(() => ({
  requests: [] as (SessionRequest | undefined)[],
  request: undefined as SessionRequest | undefined,
}));

vi.mock('@coveo/thermidor', () => ({
  createSession: () => ({
    get request() {
      return fakeSession.request;
    },
    dispatchAction: async () => {
      const next = fakeSession.requests.shift();
      if (next) {
        fakeSession.request = next;
      }
    },
    getSnapshot: () => ({turns: []}),
    subscribe: () => () => {},
  }),
}));

const action: A2uiClientMessage = {
  userAction: {
    name: 'selectSearchOption',
    surfaceId: 'next-actions-surface',
    sourceComponentId: 'root',
    timestamp: '2026-11-03T00:00:00.000Z',
    context: {optionId: 'option-1', text: 'See all kayaks'},
  },
};

function actionRequest(turnId: string): SessionRequest {
  return {
    kind: 'action',
    component: 'NextActionsBar',
    name: 'selectSearchOption',
    surfaceId: 'next-actions-surface',
    sourceComponentId: 'root',
    turnId,
  };
}

function renderStorefront() {
  const result = {} as ReturnType<typeof useStorefrontSend> & TurnViews;
  function Probe() {
    Object.assign(result, useStorefrontSend(), useTurnViews());
    return null;
  }
  render(
    <StorefrontSessionProvider>
      <Probe />
    </StorefrontSessionProvider>
  );
  return result;
}

describe('StorefrontSessionProvider', () => {
  afterEach(() => {
    cleanup();
    fakeSession.requests = [];
    fakeSession.request = undefined;
  });

  it("records the turn an action opens with the sending view's visit", () => {
    fakeSession.requests = [actionRequest('t1')];
    const storefront = renderStorefront();

    storefront.sendAction('storefront-preview-assistant', action, 3);

    expect(storefront.turnVisits.get('t1')).toBe(3);
    expect(storefront.turnViews.get('t1')).toBe('storefront-preview-assistant');
  });

  it('keeps the visit of a turn an action updates in place', () => {
    fakeSession.requests = [{kind: 'prompt', turnId: 't1'}, actionRequest('t1')];
    const storefront = renderStorefront();

    storefront.sendPrompt('storefront-preview-search', 'kayak', 1);
    fakeSession.request = undefined;
    storefront.sendAction('storefront-preview-search', action, 2);

    expect(storefront.turnVisits.get('t1')).toBe(1);
  });

  it('records nothing for an action the session withholds', () => {
    fakeSession.request = {kind: 'prompt', turnId: 't1'};
    const storefront = renderStorefront();

    storefront.sendAction('storefront-preview-assistant', action, 3);

    expect(storefront.turnVisits.size).toBe(0);
  });
});
