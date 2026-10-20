import type {
  Controller,
  ControllerDefinitionsMap,
  SolutionType,
} from '@coveo/headless/ssr-commerce-next';
import {render} from '@testing-library/react';
import {Component, type PropsWithChildren} from 'react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {createMockNavigatorContextProvider} from '../__tests__/mock-navigator-context-provider.js';
import {waitForAsyncUpdates} from '../__tests__/test-utils.js';
import type {ReactCommerceEngineDefinition} from './commerce-engine.js';
import {buildProviderWithDefinition} from './providers.js';

class ErrorBoundary extends Component<
  PropsWithChildren<{onError: (error: unknown) => void}>,
  {failed: boolean}
> {
  state = {failed: false};

  static getDerivedStateFromError() {
    return {failed: true};
  }

  componentDidCatch(error: unknown) {
    this.props.onError(error);
  }

  render() {
    return this.state.failed ? <div>failed</div> : this.props.children;
  }
}

describe('buildProviderWithDefinition', () => {
  const navigatorContext = createMockNavigatorContextProvider()();

  let hydrateStaticState: ReturnType<typeof vi.fn>;
  let definition: ReactCommerceEngineDefinition<ControllerDefinitionsMap<Controller>, SolutionType>;

  const hydrateArgs = () => hydrateStaticState.mock.calls[0][0];

  const buildStaticState = () => ({
    searchActions: [],
    controllers: {},
    navigatorContext,
  });

  beforeEach(() => {
    hydrateStaticState = vi.fn().mockResolvedValue({engine: {}, controllers: {}});
    definition = {
      hydrateStaticState,
      StateProvider: ({engine, children}: PropsWithChildren<{engine?: {id?: string}}>) => (
        <div data-testid="engine">
          {engine?.id ?? 'static'}
          {children}
        </div>
      ),
    } as unknown as ReactCommerceEngineDefinition<
      ControllerDefinitionsMap<Controller>,
      SolutionType
    >;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should forward the per-request access token carried by the static state', async () => {
    const Provider = buildProviderWithDefinition(definition);
    const staticState = {
      searchActions: [{type: 'commerce/search/executeSearch/fulfilled'}],
      controllers: {},
      navigatorContext,
      accessToken: 'per-request-token',
    };

    render(
      <Provider staticState={staticState}>
        <div />
      </Provider>
    );
    await waitForAsyncUpdates();

    expect(hydrateArgs()).toEqual(expect.objectContaining({accessToken: 'per-request-token'}));
  });

  it('should forward the navigator context carried by the static state', async () => {
    const Provider = buildProviderWithDefinition(definition);

    render(
      <Provider staticState={buildStaticState()}>
        <div />
      </Provider>
    );
    await waitForAsyncUpdates();

    expect(hydrateArgs()).toEqual(expect.objectContaining({navigatorContext}));
  });

  it('should render the hydrated engine once hydration completes', async () => {
    hydrateStaticState.mockResolvedValue({engine: {id: 'hydrated'}, controllers: {}});
    const Provider = buildProviderWithDefinition(definition);

    const {getByTestId} = render(
      <Provider staticState={buildStaticState()}>
        <div />
      </Provider>
    );

    expect(getByTestId('engine').textContent).toBe('static');

    await waitForAsyncUpdates();

    expect(getByTestId('engine').textContent).toBe('hydrated');
  });

  it('should ignore the result of a hydration that a newer static state superseded', async () => {
    let completeFirstHydration: (value: {engine: unknown; controllers: unknown}) => void = () => {};
    hydrateStaticState
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            completeFirstHydration = resolve;
          })
      )
      .mockResolvedValueOnce({engine: {id: 'second'}, controllers: {}});
    const Provider = buildProviderWithDefinition(definition);

    const {rerender, getByTestId} = render(
      <Provider staticState={buildStaticState()}>
        <div />
      </Provider>
    );
    rerender(
      <Provider staticState={buildStaticState()}>
        <div />
      </Provider>
    );
    await waitForAsyncUpdates();

    expect(getByTestId('engine').textContent).toBe('second');

    completeFirstHydration({engine: {id: 'first'}, controllers: {}});
    await waitForAsyncUpdates();

    expect(getByTestId('engine').textContent).toBe('second');
  });

  it('should rethrow a hydration failure during render so that an error boundary reports it', async () => {
    const failure = new Error('hydration failed');
    hydrateStaticState.mockRejectedValue(failure);
    const onError = vi.fn();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const Provider = buildProviderWithDefinition(definition);

    render(
      <ErrorBoundary onError={onError}>
        <Provider staticState={buildStaticState()}>
          <div />
        </Provider>
      </ErrorBoundary>
    );
    await waitForAsyncUpdates();

    expect(onError).toHaveBeenCalledWith(failure);
  });
});
