import {act, render, renderHook} from '@testing-library/react';
import type {ReactNode} from 'react';
import {describe, expect, it, vi} from 'vitest';
import type {Activity, ActionError, SessionRequest, SessionSnapshot, Turn} from '@coveo/thermidor';
import {
  announcesConcurrent,
  isBlocking,
  SessionRequestProvider,
  submitQuery,
  useActionError,
  useComponentActionError,
  useLatestWhenFree,
  type SurfaceAction,
  type QuerySubmitter,
  type SessionRequestSource,
} from './session-request.js';
import {requestSnapshot} from '../test/fake-session-requests.js';

function fakeSession(initialization?: SessionSnapshot['initialization']) {
  const listeners = new Set<() => void>();
  let snapshot = {...requestSnapshot(undefined), initialization};
  const session = {
    getSnapshot: () => snapshot,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    cancel: vi.fn(),
    dispatchAction: vi.fn(async () => {}),
  };
  const setRequest = (next: SessionRequest | undefined) => {
    snapshot = {...requestSnapshot(next), initialization};
    for (const listener of [...listeners]) {
      listener();
    }
  };
  return {session: session as SessionRequestSource & QuerySubmitter, setRequest};
}

const SUGGESTION: SessionRequest = {
  kind: 'action',
  component: 'QuerySuggestions',
  name: 'fetchSuggestions',
  surfaceId: 'shell',
  sourceComponentId: 'query-suggestions',
};

describe('isBlocking', () => {
  it('keeps the surfaces usable while suggestions are fetched', () => {
    expect(isBlocking(SUGGESTION)).toBe(false);
    expect(isBlocking({...SUGGESTION, component: 'NextActionsBar'})).toBe(true);
    expect(isBlocking({kind: 'initialize'})).toBe(true);
  });

  it('keeps the surfaces usable while recent queries are removed or cleared', () => {
    expect(isBlocking({...SUGGESTION, name: 'removeRecentQuery'})).toBe(false);
    expect(isBlocking({...SUGGESTION, name: 'clearRecentQueries'})).toBe(false);
  });
});

function withActionError<T>(actionError: ActionError, hook: () => T): T {
  const source: SessionRequestSource = {
    getSnapshot: () => ({...requestSnapshot(undefined), actionError}),
    subscribe: () => () => {},
  };
  const wrapper = ({children}: {children: ReactNode}) => (
    <SessionRequestProvider value={source}>{children}</SessionRequestProvider>
  );
  return renderHook(hook, {wrapper}).result.current;
}

const failedPageChange: ActionError = {
  message: 'Bad gateway',
  component: 'Pagination',
  name: 'selectPage',
  surfaceId: 'results',
  sourceComponentId: 'pagination',
};

const failedSuggestion: ActionError = {
  message: 'Bad gateway',
  component: 'QuerySuggestions',
  name: 'fetchSuggestions',
  surfaceId: 'shell',
  sourceComponentId: 'query-suggestions',
};

describe('useActionError', () => {
  const actionErrorOn = (surfaceId: string, actionError: ActionError) =>
    withActionError(actionError, () => useActionError(surfaceId));

  it('reports the failure of an action from the block', () => {
    expect(actionErrorOn('results', failedPageChange)).toBe('Bad gateway');
    expect(actionErrorOn('another-block', failedPageChange)).toBeUndefined();
  });

  it('does not report a failed suggestion', () => {
    expect(actionErrorOn('shell', failedSuggestion)).toBeUndefined();
  });
});

describe('useComponentActionError', () => {
  const actionErrorAt = (surfaceId: string, componentId: string, actionError: ActionError) =>
    withActionError(actionError, () => useComponentActionError(surfaceId, componentId));

  it('reports the failure of an action from the component', () => {
    expect(actionErrorAt('results', 'pagination', failedPageChange)).toBe('Bad gateway');
  });

  it('does not report it for another component, or for the same id in another block', () => {
    expect(actionErrorAt('results', 'sort', failedPageChange)).toBeUndefined();
    expect(actionErrorAt('another-block', 'pagination', failedPageChange)).toBeUndefined();
  });

  it('does not report a failed suggestion', () => {
    expect(actionErrorAt('shell', 'query-suggestions', failedSuggestion)).toBeUndefined();
  });
});

function announcing(concurrentActions: unknown): Activity {
  return {
    id: 'shell',
    kind: 'a2ui-surface',
    replace: true,
    payload: {},
    metadata: {concurrentActions},
  };
}

function initializedWith(...activities: Activity[]): SessionSnapshot['initialization'] {
  return {activities} as unknown as SessionSnapshot['initialization'];
}

describe('announcesConcurrent', () => {
  const SUGGESTIONS = {shell: {fetchSuggestions: {}}};

  it('is true when a surface announces the action, with or without a cache', () => {
    expect(
      announcesConcurrent(
        {initialization: initializedWith(announcing(SUGGESTIONS)), turns: []},
        'shell',
        'fetchSuggestions'
      )
    ).toBe(true);
    expect(
      announcesConcurrent(
        {
          initialization: initializedWith(
            announcing({shell: {fetchInstantProducts: {cache: {ttlMs: 60_000}}}})
          ),
          turns: [],
        },
        'shell',
        'fetchInstantProducts'
      )
    ).toBe(true);
  });

  it('is false when nothing announces the action', () => {
    expect(
      announcesConcurrent({initialization: undefined, turns: []}, 'shell', 'fetchSuggestions')
    ).toBe(false);
    expect(
      announcesConcurrent(
        {
          initialization: initializedWith(announcing({shell: {fetchInstantProducts: {}}})),
          turns: [],
        },
        'shell',
        'fetchSuggestions'
      )
    ).toBe(false);
  });

  it('is false when only another surface announces the action', () => {
    expect(
      announcesConcurrent(
        {initialization: initializedWith(announcing({other: {fetchSuggestions: {}}})), turns: []},
        'shell',
        'fetchSuggestions'
      )
    ).toBe(false);
  });

  it.each([
    ['an entry that is not a record', {fetchSuggestions: null}],
    ['an invalid cache policy', {fetchSuggestions: {}, fetchInstantProducts: {cache: {ttlMs: 0}}}],
  ])('ignores an announcement with %s, keeping the previous one', (_, malformed) => {
    const after = (valid: unknown) =>
      announcesConcurrent(
        {
          initialization: initializedWith(
            announcing({shell: valid}),
            announcing({shell: malformed})
          ),
          turns: [],
        },
        'shell',
        'fetchSuggestions'
      );

    expect(after({fetchInstantProducts: {}})).toBe(false);
    expect(after({fetchSuggestions: {}})).toBe(true);
  });

  it("reads a surface's latest announcement, a turn's included", () => {
    const revoking = {response: {activities: [announcing({shell: {}})]}} as unknown as Turn;
    expect(
      announcesConcurrent(
        {initialization: initializedWith(announcing(SUGGESTIONS)), turns: [revoking]},
        'shell',
        'fetchSuggestions'
      )
    ).toBe(false);
  });
});

describe('useLatestWhenFree', () => {
  function mount(
    initial: string,
    {
      concurrent,
      initialization,
    }: {concurrent?: SurfaceAction; initialization?: SessionSnapshot['initialization']} = {}
  ) {
    const {session, setRequest} = fakeSession(initialization);
    const send = vi.fn();
    function Consumer({value}: {value: string}) {
      useLatestWhenFree(value, send, concurrent);
      return null;
    }
    const view = render(
      <SessionRequestProvider value={session}>
        <Consumer value={initial} />
      </SessionRequestProvider>
    );
    return {
      send,
      setRequest: (request: SessionRequest | undefined) => act(() => setRequest(request)),
      change: (value: string) =>
        view.rerender(
          <SessionRequestProvider value={session}>
            <Consumer value={value} />
          </SessionRequestProvider>
        ),
      unmount: view.unmount,
    };
  }

  it('sends the value at once when the session is free', () => {
    const view = mount('surf');

    expect(view.send.mock.calls).toEqual([['surf']]);
  });

  it('holds values back while the session is busy, then sends only the latest', () => {
    const view = mount('');
    view.setRequest({kind: 'prompt', turnId: 'turn'});

    view.change('k');
    view.change('ka');
    view.change('kay');
    expect(view.send).not.toHaveBeenCalled();

    view.setRequest(undefined);
    expect(view.send.mock.calls).toEqual([['kay']]);
  });

  it('sends each value at once while the session is busy when the action is announced as concurrent', () => {
    const view = mount('', {
      concurrent: {surfaceId: 'shell', name: 'fetchSuggestions'},
      initialization: initializedWith(announcing({shell: {fetchSuggestions: {}}})),
    });
    view.setRequest({kind: 'prompt', turnId: 'turn'});

    view.change('k');
    view.change('ka');

    expect(view.send.mock.calls).toEqual([['k'], ['ka']]);
  });

  it('holds values back while the session is busy when the action is not announced', () => {
    const view = mount('', {concurrent: {surfaceId: 'shell', name: 'fetchSuggestions'}});
    view.setRequest({kind: 'prompt', turnId: 'turn'});

    view.change('k');
    expect(view.send).not.toHaveBeenCalled();

    view.setRequest(undefined);
    expect(view.send.mock.calls).toEqual([['k']]);
  });

  it('holds values back while the session is busy when only another surface announces the action', () => {
    const view = mount('', {
      concurrent: {surfaceId: 'shell', name: 'fetchSuggestions'},
      initialization: initializedWith(announcing({other: {fetchSuggestions: {}}})),
    });
    view.setRequest({kind: 'prompt', turnId: 'turn'});

    view.change('k');
    expect(view.send).not.toHaveBeenCalled();

    view.setRequest(undefined);
    expect(view.send.mock.calls).toEqual([['k']]);
  });

  it('does not send the value last sent again', () => {
    const view = mount('surf');
    view.setRequest(SUGGESTION);
    view.setRequest(undefined);
    view.change('surf');

    expect(view.send.mock.calls).toEqual([['surf']]);
  });

  it('sends a repeated value again once a falsy value came in between', () => {
    const view = mount('surf');
    view.change('');
    view.change('surf');

    expect(view.send.mock.calls).toEqual([['surf'], ['surf']]);
  });

  it('never sends a falsy value', () => {
    const view = mount('');
    view.change('');

    expect(view.send).not.toHaveBeenCalled();
  });

  it('sends nothing once unmounted', () => {
    const view = mount('');
    view.setRequest({kind: 'prompt', turnId: 'turn'});
    view.change('surf');
    view.unmount();

    view.setRequest(undefined);

    expect(view.send).not.toHaveBeenCalled();
  });
});

describe('submitQuery', () => {
  it('sends the prompt at once when the session is free', async () => {
    const {session} = fakeSession();

    await submitQuery(session, 'kayaks');

    expect(session.cancel).not.toHaveBeenCalled();
    expect(session.dispatchAction).toHaveBeenCalledWith({
      name: 'submitPrompt',
      payload: {prompt: 'kayaks'},
    });
  });

  it('cancels a suggestion in flight and sends the prompt once the session is free', async () => {
    const {session, setRequest} = fakeSession();
    setRequest(SUGGESTION);

    const submitted = submitQuery(session, 'kayaks');
    await Promise.resolve();

    expect(session.cancel).toHaveBeenCalledOnce();
    expect(session.dispatchAction).not.toHaveBeenCalled();

    setRequest(undefined);
    await submitted;

    expect(session.dispatchAction).toHaveBeenCalledWith({
      name: 'submitPrompt',
      payload: {prompt: 'kayaks'},
    });
  });

  it('waits for a facet search in flight without cancelling it', async () => {
    const {session, setRequest} = fakeSession();
    setRequest({...SUGGESTION, component: 'RegularFacet', name: 'search'});

    const submitted = submitQuery(session, 'kayaks');
    await Promise.resolve();

    expect(session.cancel).not.toHaveBeenCalled();
    expect(session.dispatchAction).not.toHaveBeenCalled();

    setRequest(undefined);
    await submitted;

    expect(session.dispatchAction).toHaveBeenCalledWith({
      name: 'submitPrompt',
      payload: {prompt: 'kayaks'},
    });
  });
});
