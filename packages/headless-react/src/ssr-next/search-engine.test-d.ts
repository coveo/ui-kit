import {
  defineSearchBox,
  getSampleSearchEngineConfiguration,
  type InferStaticState,
  type SearchEngine,
} from '@coveo/headless/ssr-next';
import type {ComponentProps} from 'react';
import {describe, expectTypeOf, it} from 'vitest';
import type {Hydration} from '../ssr-common/types.js';
import {buildProviderWithDefinition} from './index.js';
import {defineSearchEngine} from './search-engine.js';

// Everything below is inferred from the controllers of the definition, with no annotation on the
// customer's side.
const {controllers, useEngine, useHydration, searchEngineDefinition, standaloneEngineDefinition} =
  defineSearchEngine({
    configuration: getSampleSearchEngineConfiguration(),
    controllers: {searchBox: defineSearchBox()},
  });

const SearchProvider = buildProviderWithDefinition(searchEngineDefinition);

describe('defineSearchEngine', () => {
  it('should derive one hook per controller, including the parameter manager', () => {
    expectTypeOf(controllers).toHaveProperty('useSearchBox');
    expectTypeOf(controllers).toHaveProperty('useParameterManager');
    expectTypeOf(controllers.useSearchBox).returns.toHaveProperty('state');
    expectTypeOf(controllers.useSearchBox).returns.toHaveProperty('methods');
  });

  it('should expose the engine and the hydration status', () => {
    expectTypeOf(useEngine).returns.toEqualTypeOf<SearchEngine | undefined>();
    expectTypeOf(useHydration).returns.toEqualTypeOf<Hydration>();
  });

  it('should give both definitions a state provider', () => {
    expectTypeOf(searchEngineDefinition).toHaveProperty('StateProvider');
    expectTypeOf(standaloneEngineDefinition).toHaveProperty('StateProvider');
  });

  it('should type the state provider with the controllers of the page', () => {
    type StateProviderProps = ComponentProps<typeof searchEngineDefinition.StateProvider>;

    expectTypeOf<keyof StateProviderProps['controllers']>().toEqualTypeOf<
      'searchBox' | 'parameterManager'
    >();
    expectTypeOf<StateProviderProps['engine']>().toEqualTypeOf<SearchEngine | undefined>();
  });

  it('should build a provider that takes the static state of its definition', () => {
    expectTypeOf<ComponentProps<typeof SearchProvider>['staticState']>().toEqualTypeOf<
      InferStaticState<typeof searchEngineDefinition>
    >();
    expectTypeOf<ComponentProps<typeof SearchProvider>['onHydrationError']>().toEqualTypeOf<
      ((error: unknown) => void) | undefined
    >();
  });
});
