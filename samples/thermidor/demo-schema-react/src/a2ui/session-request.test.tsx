import {act, render, renderHook} from '@testing-library/react';
import type {ReactNode} from 'react';
import {describe, expect, it, vi} from 'vitest';
import type {ActionError, SessionRequest, SessionSnapshot, Turn} from '@coveo/thermidor';
import {
  isBlocking,
  SessionRequestProvider,
  submitQuery,
  useActionError,
  useLatestWhenFree,
  type QuerySubmitter,
  type SessionRequestSource,
} from './session-request.js';
import {requestSnapshot} from '../test/fake-session-requests.js';

function fakeSession() {
  const listeners = new Set<() => void>();
  let snapshot = requestSnapshot(undefined);
  const session = {
    getSnapshot: () => snapshot,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    cancel: vi.fn(),
    dispatchAction: vi.fn(async () => {}),
  };
  const setRequest = (next: SessionRequest | undefined, turns: SessionSnapshot['turns'] = []) => {
    snapshot = {...requestSnapshot(next), turns};
    for (const listener of [...listeners]) {
      listener();
    }
  };
  return {session: session as SessionRequestSource & QuerySubmitter, setRequest};
}

const STREAMING_ANSWER = {
  id: 'turn-2',
  input: {prompt: 'which is best for running?'},
  response: {activities: [], surfaces: []},
  status: 'streaming',
} as unknown as Turn;

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
});

describe('useActionError', () => {
  function actionErrorOn(surfaceId: string, actionError: ActionError) {
    const source: SessionRequestSource = {
      getSnapshot: () => ({...requestSnapshot(undefined), actionError}),
      subscribe: () => () => {},
    };
    const wrapper = ({children}: {children: ReactNode}) => (
      <SessionRequestProvider value={source}>{children}</SessionRequestProvider>
    );
    return renderHook(() => useActionError(surfaceId), {wrapper}).result.current;
  }

  const failedPageChange: ActionError = {
    message: 'Bad gateway',
    component: 'Pagination',
    name: 'selectPage',
    surfaceId: 'results',
    sourceComponentId: 'pagination',
  };

  it('reports the failure of an action from the block', () => {
    expect(actionErrorOn('results', failedPageChange)).toBe('Bad gateway');
    expect(actionErrorOn('another-block', failedPageChange)).toBeUndefined();
  });

  it('does not report a failed suggestion', () => {
    expect(
      actionErrorOn('shell', {
        message: 'Bad gateway',
        component: 'QuerySuggestions',
        name: 'fetchSuggestions',
        surfaceId: 'shell',
        sourceComponentId: 'query-suggestions',
      })
    ).toBeUndefined();
  });
});

describe('useLatestWhenFree', () => {
  function mount(initial: string) {
    const {session, setRequest} = fakeSession();
    const send = vi.fn();
    function Consumer({value}: {value: string}) {
      useLatestWhenFree(value, send);
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

  it('adds a question asked during an answer to that answer at once', async () => {
    vi.stubEnv('VITE_COVEO_ACTIONS_DURING_ANSWER', 'true');
    const {session, setRequest} = fakeSession();
    setRequest({kind: 'prompt', turnId: STREAMING_ANSWER.id}, [STREAMING_ANSWER]);

    await submitQuery(session, 'make it under $1000');

    expect(session.cancel).not.toHaveBeenCalled();
    expect(session.dispatchAction).toHaveBeenCalledWith({
      name: 'submitPrompt',
      payload: {prompt: 'make it under $1000'},
    });
    vi.unstubAllEnvs();
  });

  it('adds every question asked during an answer, in order', async () => {
    vi.stubEnv('VITE_COVEO_ACTIONS_DURING_ANSWER', 'true');
    const {session, setRequest} = fakeSession();
    setRequest({kind: 'prompt', turnId: STREAMING_ANSWER.id}, [STREAMING_ANSWER]);

    await submitQuery(session, 'for a beginner');
    await submitQuery(session, 'under $1000');

    expect(vi.mocked(session.dispatchAction).mock.calls.map(([action]) => action)).toEqual([
      {name: 'submitPrompt', payload: {prompt: 'for a beginner'}},
      {name: 'submitPrompt', payload: {prompt: 'under $1000'}},
    ]);
    vi.unstubAllEnvs();
  });

  it('waits for the answer in progress when actions during an answer are off', async () => {
    vi.stubEnv('VITE_COVEO_ACTIONS_DURING_ANSWER', 'false');
    const {session, setRequest} = fakeSession();
    setRequest({kind: 'prompt', turnId: STREAMING_ANSWER.id}, [STREAMING_ANSWER]);

    const submitted = submitQuery(session, 'show me trail shoes instead');
    await Promise.resolve();

    expect(session.dispatchAction).not.toHaveBeenCalled();
    setRequest(undefined, [{...STREAMING_ANSWER, status: 'complete'}]);
    await submitted;

    expect(session.dispatchAction).toHaveBeenCalledOnce();
    vi.unstubAllEnvs();
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
