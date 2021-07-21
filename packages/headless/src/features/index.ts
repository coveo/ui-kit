export * from './advanced-search-queries/advanced-search-queries-actions-loader';
export * from './facets/category-facet-set/category-facet-set-actions-loader';
export * from './facets/facet-set/facet-set-actions-loader';
export * from './configuration/configuration-actions-loader';
export * from './configuration/search-configuration-actions-loader';
export * from './context/context-actions-loader';
export * from './debug/debug-actions-loader';
export * from './facets/range-facets/date-facet-set/date-facet-actions-loader';
export * from './facet-options/facet-options-actions-loader';
export * from './did-you-mean/did-you-mean-actions-loader';
export * from './fields/fields-actions-loader';
export * from './history/history-actions-loader';
export * from './facets/range-facets/numeric-facet-set/numeric-facet-actions-loader';
export * from './pagination/pagination-actions-loader';
export * from './pipeline/pipeline-actions-loader';
export * from './query/query-actions-loader';
export * from './query-set/query-set-actions-loader';
export * from './query-suggest/query-suggest-actions-loader';
export * from './redirection/redirection-actions-loader';
export * from './search/search-actions-loader';
export * from './search-hub/search-hub-actions-loader';
export * from './sort-criteria/sort-criteria-actions-loader';
export * from './question-answering/question-answering-actions-loader';
export * from './facets/generic/breadcrumb-actions-loader';

export {
  ResultTemplatesManager,
  buildResultTemplatesManager,
} from './result-templates/result-templates-manager';

import {
  getResultProperty as getResultPropertyAlias,
  fieldsMustBeDefined as fieldsMustBeDefinedAlias,
  fieldsMustNotBeDefined as fieldsMustNotBeDefinedAlias,
  fieldMustMatch as fieldMustMatchAlias,
  fieldMustNotMatch as fieldMustNotMatchAlias,
} from './result-templates/result-templates-helpers';
export namespace ResultTemplatesHelpers {
  export const getResultProperty = getResultPropertyAlias;
  export const fieldsMustBeDefined = fieldsMustBeDefinedAlias;
  export const fieldsMustNotBeDefined = fieldsMustNotBeDefinedAlias;
  export const fieldMustMatch = fieldMustMatchAlias;
  export const fieldMustNotMatch = fieldMustNotMatchAlias;
}
