import {describe, expectTypeOf, it} from 'vitest';
import {getSampleSearchEngineConfiguration} from '../../../app/search-engine/search-engine-configuration.js';
import type {EngineDefinition} from '../../common/types/engine.js';
import {defineResultList} from '../controllers/result-list/headless-result-list.ssr.js';
import {defineSearchBox} from '../controllers/search-box/headless-search-box.ssr.js';
import type {InferHydratedState, InferStaticState} from '../types/controller-definition.js';
import type {SearchEngineDefinitionOptions} from '../types/engine.js';
import type {SearchStaticState as StaticStateOf} from '../types/fetch-static-state.js';
import type {SearchHydratedState as HydratedStateOf} from '../types/hydrate-static-state.js';
import {defineSearchEngine} from './search-engine.ssr.js';

const controllers = {
  searchBox: defineSearchBox(),
  resultList: defineResultList(),
};

// Types the customer relies on for IntelliSense: everything below is inferred from the controllers
// of the definition, with no annotation on the customer's side.
const {searchEngineDefinition, standaloneEngineDefinition} = defineSearchEngine({
  configuration: getSampleSearchEngineConfiguration(),
  controllers,
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

describe('the static and hydrated states of a search engine definition', () => {
  it('should be named after the controllers of the definition', () => {
    expectTypeOf<SearchStaticState>().toEqualTypeOf<StaticStateOf<typeof controllers>>();
    expectTypeOf<SearchHydratedState>().toEqualTypeOf<HydratedStateOf<typeof controllers>>();
  });

  it('should name exactly the defined controllers and the baked-in parameter manager', () => {
    type ControllerNames = 'searchBox' | 'resultList' | 'parameterManager';
    expectTypeOf<keyof SearchHydratedState['controllers']>().toEqualTypeOf<ControllerNames>();
    expectTypeOf<keyof SearchStaticState['controllers']>().toEqualTypeOf<ControllerNames>();
  });
});

describe('SearchEngineDefinitionOptions', () => {
  it('should check a configuration kept apart from the definition, with no type argument', () => {
    const config = {
      configuration: getSampleSearchEngineConfiguration(),
      controllers: {searchBox: defineSearchBox()},
    } satisfies SearchEngineDefinitionOptions;

    expectTypeOf<
      keyof InferHydratedState<
        ReturnType<typeof defineSearchEngine<typeof config.controllers>>['searchEngineDefinition']
      >['controllers']
    >().toEqualTypeOf<'searchBox' | 'parameterManager'>();
    expectTypeOf<{searchBox: number}>().not.toExtend<
      NonNullable<SearchEngineDefinitionOptions['controllers']>
    >();
  });
});

describe('EngineDefinition', () => {
  // What code written for any engine definition looks like: two plain type parameters.
  function hydrate<TStaticState, THydratedState>(
    definition: EngineDefinition<TStaticState, THydratedState>,
    staticState: TStaticState
  ) {
    return definition.hydrateStaticState(staticState);
  }

  it('should describe every search engine definition', () => {
    type FetchOptions = Parameters<typeof searchEngineDefinition.fetchStaticState>[0];
    expectTypeOf(searchEngineDefinition).toExtend<
      EngineDefinition<SearchStaticState, SearchHydratedState, FetchOptions>
    >();
    expectTypeOf(standaloneEngineDefinition).toExtend<
      EngineDefinition<SearchStaticState, SearchHydratedState, FetchOptions>
    >();
  });

  it('should keep the controllers typed in code written for any engine definition', () => {
    expectTypeOf(
      hydrate(searchEngineDefinition, {} as SearchStaticState)
    ).resolves.toEqualTypeOf<SearchHydratedState>();
  });

  it('should refuse a static state that the engine definition did not fetch', () => {
    // @ts-expect-error: a static state without the controllers of the definition.
    hydrate(searchEngineDefinition, {searchActions: [], controllers: {}});
  });
});
