import type {
  Controller,
  ControllerDefinitionsMap,
  SolutionType,
} from '@coveo/headless/ssr-commerce';
import {render} from '@testing-library/react';
import type {PropsWithChildren} from 'react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {createMockNavigatorContextProvider} from '../__tests__/mock-navigator-context-provider.js';
import {waitForAsyncUpdates} from '../__tests__/test-utils.js';
import type {ReactCommerceEngineDefinition} from './commerce-engine.js';
import {buildProviderWithDefinition} from './providers.js';

describe('buildProviderWithDefinition', () => {
  const navigatorContext = createMockNavigatorContextProvider()();
  const staticState = {
    searchActions: [{type: 'commerce/search/executeSearch/fulfilled'}],
    controllers: {},
  };

  let hydrateStaticState: ReturnType<typeof vi.fn>;
  let definition: ReactCommerceEngineDefinition<ControllerDefinitionsMap<Controller>, SolutionType>;

  const hydrateArgs = () => hydrateStaticState.mock.calls[0][0];

  beforeEach(() => {
    hydrateStaticState = vi.fn().mockResolvedValue({engine: {}, controllers: {}});
    definition = {
      setNavigatorContextProvider: vi.fn(),
      hydrateStaticState,
      StateProvider: ({children}: PropsWithChildren) => <>{children}</>,
    } as unknown as ReactCommerceEngineDefinition<
      ControllerDefinitionsMap<Controller>,
      SolutionType
    >;
  });

  describe('per-request access token', () => {
    it('should forward the access token to hydrateStaticState when provided', async () => {
      const Provider = buildProviderWithDefinition(definition);

      render(
        <Provider
          staticState={staticState}
          navigatorContext={navigatorContext}
          accessToken="per-request-token"
        >
          <div />
        </Provider>
      );
      await waitForAsyncUpdates();

      expect(hydrateArgs()).toEqual(expect.objectContaining({accessToken: 'per-request-token'}));
    });

    it('should not send an access token when the prop is omitted', async () => {
      const Provider = buildProviderWithDefinition(definition);

      render(
        <Provider staticState={staticState} navigatorContext={navigatorContext}>
          <div />
        </Provider>
      );
      await waitForAsyncUpdates();

      expect(hydrateArgs()).not.toHaveProperty('accessToken');
    });

    it('should still forward the search actions alongside the access token', async () => {
      const Provider = buildProviderWithDefinition(definition);

      render(
        <Provider
          staticState={staticState}
          navigatorContext={navigatorContext}
          accessToken="per-request-token"
        >
          <div />
        </Provider>
      );
      await waitForAsyncUpdates();

      expect(hydrateArgs().searchActions).toEqual(staticState.searchActions);
    });
  });
});
