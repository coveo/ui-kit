import {getSampleSearchEngineConfiguration} from '@coveo/headless/ssr-next';
import {render, waitFor} from '@testing-library/react';
import {Component, type PropsWithChildren} from 'react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {createMockNavigatorContextProvider} from '../__tests__/mock-navigator-context-provider.js';
import {defineMockSearchController} from '../__tests__/mock-ssr-controller-definitions.js';
import {waitForAsyncUpdates} from '../__tests__/test-utils.js';
import {buildProviderWithDefinition} from './providers.js';
import {defineSearchEngine} from './search-engine.js';

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
  const engineDefinition = defineSearchEngine({
    configuration: getSampleSearchEngineConfiguration(),
    controllers: {searchBox: defineMockSearchController()},
  });
  const {useEngine, useHydration} = engineDefinition;

  let hydrateStaticState: ReturnType<typeof vi.fn>;
  let definition: typeof engineDefinition.searchEngineDefinition;

  const buildStaticState = () =>
    ({
      searchActions: [],
      controllers: {
        searchBox: {state: {value: 'static query'}},
        parameterManager: {state: {parameters: {}}},
      },
      navigatorContext,
      accessToken: 'per-request-token',
    }) as unknown as Parameters<typeof definition.hydrateStaticState>[0];

  const hydratedState = () => ({
    engine: {id: 'hydrated'},
    controllers: {
      searchBox: {state: {value: 'hydrated query'}, subscribe: vi.fn(() => vi.fn())},
      parameterManager: {state: {parameters: {}}, subscribe: vi.fn(() => vi.fn())},
    },
  });

  function Status() {
    const engine = useEngine() as {id?: string} | undefined;
    const hydration = useHydration();
    return (
      <div data-testid="status">
        {hydration.status}:{engine?.id ?? 'none'}
      </div>
    );
  }

  beforeEach(() => {
    hydrateStaticState = vi.fn().mockResolvedValue(hydratedState());
    definition = {...engineDefinition.searchEngineDefinition, hydrateStaticState};
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should hydrate with the static state as is', async () => {
    const Provider = buildProviderWithDefinition(definition);
    const staticState = buildStaticState();

    render(
      <Provider staticState={staticState}>
        <Status />
      </Provider>
    );
    await waitForAsyncUpdates();

    expect(hydrateStaticState).toHaveBeenCalledWith(staticState);
  });

  it('should render the static state, then the hydrated engine', async () => {
    const Provider = buildProviderWithDefinition(definition);

    const {getByTestId} = render(
      <Provider staticState={buildStaticState()}>
        <Status />
      </Provider>
    );

    expect(getByTestId('status').textContent).toBe('static:none');

    await waitForAsyncUpdates();

    expect(getByTestId('status').textContent).toBe('hydrated:hydrated');
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
          <Status />
        </Provider>
      </ErrorBoundary>
    );
    await waitForAsyncUpdates();

    expect(onError).toHaveBeenCalledWith(failure);
  });

  it('should keep rendering the static state and report the error when onHydrationError handles it', async () => {
    const failure = new Error('hydration failed');
    hydrateStaticState.mockRejectedValue(failure);
    const onHydrationError = vi.fn();
    const Provider = buildProviderWithDefinition(definition);

    const {getByTestId} = render(
      <Provider staticState={buildStaticState()} onHydrationError={onHydrationError}>
        <Status />
      </Provider>
    );

    await waitFor(() => expect(onHydrationError).toHaveBeenCalledWith(failure));
    expect(getByTestId('status').textContent).toBe('error:none');
  });
});
