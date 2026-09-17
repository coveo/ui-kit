import type {
  Controller,
  ControllerDefinitionsMap,
  SolutionType,
} from '@coveo/headless/ssr-commerce-next';
import {render} from '@testing-library/react';
import type {PropsWithChildren} from 'react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {createMockNavigatorContextProvider} from '../__tests__/mock-navigator-context-provider.js';
import {waitForAsyncUpdates} from '../__tests__/test-utils.js';
import type {ReactCommerceEngineDefinition} from './commerce-engine.js';
import {buildProviderWithDefinition} from './providers.js';

describe('buildProviderWithDefinition', () => {
  const navigatorContext = createMockNavigatorContextProvider()();

  let hydrateStaticState: ReturnType<typeof vi.fn>;
  let definition: ReactCommerceEngineDefinition<ControllerDefinitionsMap<Controller>, SolutionType>;

  const hydrateArgs = () => hydrateStaticState.mock.calls[0][0];

  beforeEach(() => {
    hydrateStaticState = vi.fn().mockResolvedValue({engine: {}, controllers: {}});
    definition = {
      hydrateStaticState,
      StateProvider: ({children}: PropsWithChildren) => <>{children}</>,
    } as unknown as ReactCommerceEngineDefinition<
      ControllerDefinitionsMap<Controller>,
      SolutionType
    >;
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
    const staticState = {
      searchActions: [],
      controllers: {},
      navigatorContext,
    };

    render(
      <Provider staticState={staticState}>
        <div />
      </Provider>
    );
    await waitForAsyncUpdates();

    expect(hydrateArgs()).toEqual(expect.objectContaining({navigatorContext}));
  });
});
