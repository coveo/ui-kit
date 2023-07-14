import {
  CoreEngine,
  SearchEngine,
  getSampleSearchEngineConfiguration,
} from '@coveo/headless';
import {SearchParameterSerializer} from '@/utils/search-parameter-serializer';
import {
  defineSearchBox,
  defineResultList,
  defineFacet,
  defineSearchParameterManager,
} from '@/utils/ssr-headless';
import {defineSearchEngine} from '@/utils/ssr-headless-react';
import {
  InferExecutionResult,
  InferHydrationResult,
} from '@/utils/ssr-headless.types';

export const engineDefinition = defineSearchEngine({
  configuration: {
    ...getSampleSearchEngineConfiguration(),
    analytics: {enabled: false},
  },
  controllers: {
    searchBox: defineSearchBox(),
    resultList: defineResultList(),
    authorFacet: defineFacet({options: {facetId: 'author', field: 'author'}}),
    searchParametersManager: defineSearchParameterManager(),
  },
});

export const {executeOnce, hydrate} = engineDefinition;
export type SearchExecutionResult = InferExecutionResult<
  typeof engineDefinition
>;
export type SearchHydrationResult = InferHydrationResult<
  typeof engineDefinition
>;
