import {act, render, renderHook} from '@testing-library/react';
import type {ReactNode} from 'react';
import {describe, expect, it, vi} from 'vitest';
import type {ActionError, SessionRequest} from '@coveo/thermidor';
import {
  hasFailed,
  isBlocking,
  isConcurrentInFlight,
  SessionRequestProvider,
  submitQuery,
  useActionError,
  useComponentActionError,
  useDispatchOutcome,
  useLatestWhenFree,
  type SurfaceAction,
  type QuerySubmitter,
  type SessionRequestSource,
} from './session-request.js';
import {requestSnapshot} from '../test/fake-session-requests.js';

function fakeSession(concurrent: readonly SurfaceAction[] = []) {
  const listeners = new Set<() => void>();
  let snapshot = requestSnapshot(undefined);
  const session = {
    getSnapshot: () => snapshot,
    isConcurrent: ({surfaceId, name}: SurfaceAction) =>
      concurrent.some((action) => action.surfaceId === surfaceId && action.name === name),
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    cancel: vi.fn(),
    dispatchAction: vi.fn(async () => {}),
  };
  const setRequest = (next: SessionRequest | undefined, actionError?: ActionError) => {
    snapshot = requestSnapshot(next, actionError);
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
  sourceComponentId: 'query_suggestions',
};

function withSession(session: SessionRequestSource) {
  return ({children}: {children: ReactNode}) => (
    <SessionRequestProvider value={session}>{children}</SessionRequestProvider>
  );
}

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

describe('isConcurrentInFlight and hasFailed', () => {
  const suggestions = {
    surfaceId: 'shell',
    sourceComponentId: 'query_suggestions',
    name: 'fetchSuggestions',
  };
  const listed = {component: 'QuerySuggestions', ...suggestions};

  it('reads whether the node action is listed among the concurrent requests', () => {
    const snapshot = {...requestSnapshot(undefined), concurrentRequests: [listed]};

    expect(isConcurrentInFlight(snapshot, suggestions)).toBe(true);
    expect(isConcurrentInFlight(snapshot, {...suggestions, sourceComponentId: 'other'})).toBe(
      false
    );
    expect(isConcurrentInFlight(requestSnapshot(undefined), suggestions)).toBe(false);
  });

  it("reads a concurrent dispatch's failure from concurrentFailures only", () => {
    const failure = {...listed, message: 'Refused'};
    const concurrentFailure = {...requestSnapshot(undefined), concurrentFailures: [failure]};

    expect(hasFailed(concurrentFailure, suggestions, true)).toBe(true);
    expect(hasFailed(concurrentFailure, {...suggestions, sourceComponentId: 'other'}, true)).toBe(
      false
    );
    expect(hasFailed(concurrentFailure, suggestions, false)).toBe(false);
  });

  it("reads an ordinary dispatch's failure from actionError only", () => {
    const ordinaryFailure = requestSnapshot(undefined, {...listed, message: 'Refused'});

    expect(hasFailed(ordinaryFailure, suggestions, false)).toBe(true);
    expect(hasFailed(ordinaryFailure, {...suggestions, name: 'removeRecentQuery'}, false)).toBe(
      false
    );
    expect(hasFailed(ordinaryFailure, suggestions, true)).toBe(false);
    expect(hasFailed(requestSnapshot(undefined), suggestions, false)).toBe(false);
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
  sourceComponentId: 'query_suggestions',
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
    expect(actionErrorAt('shell', 'query_suggestions', failedSuggestion)).toBeUndefined();
  });
});

describe('useLatestWhenFree', () => {
  function mount(
    initial: string,
    {
      concurrent,
      sessionConcurrent = [],
    }: {concurrent?: SurfaceAction; sessionConcurrent?: readonly SurfaceAction[]} = {}
  ) {
    const {session, setRequest} = fakeSession(sessionConcurrent);
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

  it('sends each value at once while the session is busy when the session sends the action concurrently', () => {
    const view = mount('', {
      concurrent: {surfaceId: 'shell', name: 'fetchSuggestions'},
      sessionConcurrent: [{surfaceId: 'shell', name: 'fetchSuggestions'}],
    });
    view.setRequest({kind: 'prompt', turnId: 'turn'});

    view.change('k');
    view.change('ka');

    expect(view.send.mock.calls).toEqual([['k'], ['ka']]);
  });

  it('holds values back while the session is busy when the session does not send the action concurrently', () => {
    const view = mount('', {concurrent: {surfaceId: 'shell', name: 'fetchSuggestions'}});
    view.setRequest({kind: 'prompt', turnId: 'turn'});

    view.change('k');
    expect(view.send).not.toHaveBeenCalled();

    view.setRequest(undefined);
    expect(view.send.mock.calls).toEqual([['k']]);
  });

  it('holds values back while the session is busy when the session sends the action concurrently from another surface only', () => {
    const view = mount('', {
      concurrent: {surfaceId: 'shell', name: 'fetchSuggestions'},
      sessionConcurrent: [{surfaceId: 'other', name: 'fetchSuggestions'}],
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

describe('useDispatchOutcome', () => {
  const suggestions = {
    surfaceId: 'shell',
    sourceComponentId: 'query_suggestions',
    name: 'fetchSuggestions',
  };

  it('reads an ordinary dispatch as failed when actionError names it as it resolves', async () => {
    const {session, setRequest} = fakeSession();
    const {result} = renderHook(() => useDispatchOutcome(), {wrapper: withSession(session)});

    const failed = result.current(suggestions, () =>
      setRequest(undefined, {...SUGGESTION, message: 'Boom'})
    );
    await expect(failed).resolves.toBe('failed');

    const applied = result.current(suggestions, () => setRequest(undefined));
    await expect(applied).resolves.toBe('applied');
  });

  it('reads a concurrent dispatch as superseded while a later one is in flight', async () => {
    const {session} = fakeSession([suggestions]);
    const {result} = renderHook(() => useDispatchOutcome(), {wrapper: withSession(session)});
    const snapshot = {
      ...session.getSnapshot(),
      concurrentRequests: [{...SUGGESTION, component: 'QuerySuggestions'}],
    };
    session.getSnapshot = () => snapshot;

    await expect(result.current(suggestions, () => {})).resolves.toBe('superseded');
  });
});
