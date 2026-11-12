import {describe, expectTypeOf, it} from 'vitest';
import {getSampleSearchEngineConfiguration} from '../../../app/search-engine/search-engine-configuration.js';
import type {ContextPayload} from '../../../features/context/context-state.js';
import {defineResultList} from '../controllers/result-list/headless-result-list.ssr.js';
import {defineSearchBox} from '../controllers/search-box/headless-search-box.ssr.js';
import type {InferHydratedState, InferStaticState} from '../types/controller-definition.js';
import type {SearchEngineDefinitionOptions} from '../types/engine.js';
import {defineSearchEngine} from './search-engine.ssr.js';

// Types the customer relies on for IntelliSense: everything below is inferred from the controllers
// of the definition, with no annotation on the customer's side.
const {searchEngineDefinition, standaloneEngineDefinition} = defineSearchEngine({
  configuration: getSampleSearchEngineConfiguration(),
  controllers: {
    searchBox: defineSearchBox(),
    resultList: defineResultList(),
  },
});

type SearchStaticState = InferStaticState<typeof searchEngineDefinition>;
type SearchHydratedState = InferHydratedState<typeof searchEngineDefinition>;

describe('defineSearchEngine', () => {
  it('should hydrate each definition with the static state it fetched, as is', () => {
    expectTypeOf<
      Parameters<typeof searchEngineDefinition.hydrateStaticState>[0]
    >().toEqualTypeOf<SearchStaticState>();
    expectTypeOf<
      Parameters<typeof standaloneEngineDefinition.hydrateStaticState>[0]
    >().toEqualTypeOf<InferStaticState<typeof standaloneEngineDefinition>>();
  });

  it('should take the navigator context per request, not on the definition', () => {
    expectTypeOf<SearchEngineDefinitionOptions>().not.toHaveProperty('navigatorContextProvider');
    expectTypeOf<SearchStaticState>().toHaveProperty('navigatorContext');
    expectTypeOf<SearchStaticState['accessToken']>().toEqualTypeOf<string | undefined>();
  });

  it('should take page facts only, with the custom context as one of them', () => {
    type SearchFetchOptions = Parameters<typeof searchEngineDefinition.fetchStaticState>[0];
    expectTypeOf<SearchFetchOptions['context']>().toEqualTypeOf<ContextPayload | undefined>();
    expectTypeOf<SearchFetchOptions>().not.toHaveProperty('controllers');
    expectTypeOf<SearchStaticState>().not.toHaveProperty('controllerProps');
    expectTypeOf<SearchStaticState['controllers']>().toHaveProperty('context');
  });

  it('should list the defined controllers and the parameter manager in the static state', () => {
    expectTypeOf<SearchStaticState['controllers']>().toHaveProperty('searchBox');
    expectTypeOf<SearchStaticState['controllers']>().toHaveProperty('resultList');
    expectTypeOf<SearchStaticState['controllers']>().toHaveProperty('parameterManager');
    expectTypeOf<SearchStaticState['controllers']['searchBox']>().toHaveProperty('state');
    expectTypeOf<SearchStaticState['controllers']['searchBox']>().not.toHaveProperty('subscribe');
  });

  it('should hydrate the controllers as live controllers', () => {
    expectTypeOf<SearchHydratedState['controllers']['searchBox']>().toHaveProperty('subscribe');
    expectTypeOf<SearchHydratedState['controllers']['parameterManager']>().toHaveProperty(
      'synchronize'
    );
  });
});
