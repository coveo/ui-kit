import {
  getResultProperty as getResultPropertyAlias,
  fieldsMustBeDefined as fieldsMustBeDefinedAlias,
  fieldsMustNotBeDefined as fieldsMustNotBeDefinedAlias,
  fieldMustMatch as fieldMustMatchAlias,
  fieldMustNotMatch as fieldMustNotMatchAlias,
} from './result-templates/result-templates-helpers.js';

export * from './advanced-search-queries/advanced-search-queries-actions-loader.js';
export * from './facets/category-facet-set/category-facet-set-actions-loader.js';
export * from './facets/facet-set/facet-set-actions-loader.js';
export * from './configuration/configuration-actions-loader.js';
export * from './configuration/search-configuration-actions-loader.js';
export * from './context/context-actions-loader.js';
export * from './dictionary-field-context/dictionary-field-context-actions-loader.js';
export * from './debug/debug-actions-loader.js';
export * from './facets/range-facets/date-facet-set/date-facet-actions-loader.js';
export * from './facet-options/facet-options-actions-loader.js';
export * from './did-you-mean/did-you-mean-actions-loader.js';
export * from './fields/fields-actions-loader.js';
export * from './history/history-actions-loader.js';
export * from './facets/range-facets/numeric-facet-set/numeric-facet-actions-loader.js';
export * from './folding/folding-actions-loader.js';
export * from './pagination/pagination-actions-loader.js';
export * from './pipeline/pipeline-actions-loader.js';
export * from './query/query-actions-loader.js';
export * from './query-set/query-set-actions-loader.js';
export * from './instant-results/instant-results-actions-loader.js';
export * from './query-suggest/query-suggest-actions-loader.js';
export * from './search/search-actions-loader.js';
export * from './search-hub/search-hub-actions-loader.js';
export * from './sort-criteria/sort-criteria-actions-loader.js';
export * from './standalone-search-box-set/standalone-search-box-set-actions-loader.js';
export * from './static-filter-set/static-filter-set-actions-loader.js';
export * from './tab-set/tab-set-actions-loader.js';
export * from './question-answering/question-answering-actions-loader.js';
export * from './breadcrumb/breadcrumb-actions-loader.js';
export * from './recent-queries/recent-queries-actions-loader.js';
export * from './recent-results/recent-results-actions-loader.js';
export * from './excerpt-length/excerpt-length-actions-loader.js';
export * from './result-preview/result-preview-actions-loader.js';
export * from './generated-answer/generated-answer-actions-loader.js';

export type {ResultTemplatesManager} from './result-templates/result-templates-manager.js';
export {buildResultTemplatesManager} from './result-templates/result-templates-manager.js';

export namespace ResultTemplatesHelpers {
  export const getResultProperty = getResultPropertyAlias;
  export const fieldsMustBeDefined = fieldsMustBeDefinedAlias;
  export const fieldsMustNotBeDefined = fieldsMustNotBeDefinedAlias;
  export const fieldMustMatch = fieldMustMatchAlias;
  export const fieldMustNotMatch = fieldMustNotMatchAlias;
}
