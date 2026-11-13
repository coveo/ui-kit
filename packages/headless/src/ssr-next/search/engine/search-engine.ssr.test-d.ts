import {describe, expectTypeOf, it} from 'vitest';
import {getSampleSearchEngineConfiguration} from '../../../app/search-engine/search-engine-configuration.js';
import {defineResultList} from '../controllers/result-list/headless-result-list.ssr.js';
import {defineSearchBox} from '../controllers/search-box/headless-search-box.ssr.js';
import type {InferStaticState} from '../types/controller-definition.js';
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

describe('defineSearchEngine', () => {
  it('should hydrate each definition with the static state it fetched, as is', () => {
    expectTypeOf<
      Parameters<typeof searchEngineDefinition.hydrateStaticState>[0]
    >().toEqualTypeOf<SearchStaticState>();
    expectTypeOf<
      Parameters<typeof standaloneEngineDefinition.hydrateStaticState>[0]
    >().toEqualTypeOf<InferStaticState<typeof standaloneEngineDefinition>>();
  });
});
