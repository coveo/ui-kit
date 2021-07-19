import {advancedSearchQueriesReducer} from '../features/advanced-search-queries/advanced-search-queries-slice';
import {configurationReducer} from '../features/configuration/configuration-slice';
import {contextReducer} from '../features/context/context-slice';
import {debugReducer} from '../features/debug/debug-slice';
import {versionReducer} from '../features/debug/version-slice';
import {didYouMeanReducer} from '../features/did-you-mean/did-you-mean-slice';
import {facetOptionsReducer} from '../features/facet-options/facet-options-slice';
import {categoryFacetSetReducer} from '../features/facets/category-facet-set/category-facet-set-slice';
import {facetOrderReducer} from '../features/facets/facet-order/facet-order-slice';
import {categoryFacetSearchSetReducer} from '../features/facets/facet-search-set/category/category-facet-search-set-slice';
import {specificFacetSearchSetReducer} from '../features/facets/facet-search-set/specific/specific-facet-search-set-slice';
import {facetSetReducer} from '../features/facets/facet-set/facet-set-slice';
import {dateFacetSetReducer} from '../features/facets/range-facets/date-facet-set/date-facet-set-slice';
import {numericFacetSetReducer} from '../features/facets/range-facets/numeric-facet-set/numeric-facet-set-slice';
import {relativeDateSetReducer} from '../features/relative-date-set/relative-date-set-slice';
import {fieldsReducer} from '../features/fields/fields-slice';
import {foldingReducer} from '../features/folding/folding-slice';
import {redo, snapshot, undo} from '../features/history/history-actions';
import {historyReducer} from '../features/history/history-slice';
import {paginationReducer} from '../features/pagination/pagination-slice';
import {pipelineReducer} from '../features/pipeline/pipeline-slice';
import {productRecommendationsReducer} from '../features/product-recommendations/product-recommendations-slice';
import {querySetReducer} from '../features/query-set/query-set-slice';
import {querySuggestReducer} from '../features/query-suggest/query-suggest-slice';
import {queryReducer} from '../features/query/query-slice';
import {questionAnsweringReducer} from '../features/question-answering/question-answering-slice';
import {recommendationReducer} from '../features/recommendation/recommendation-slice';
import {redirectionReducer} from '../features/redirection/redirection-slice';
import {resultPreviewReducer} from '../features/result-preview/result-preview-slice';
import {searchHubReducer} from '../features/search-hub/search-hub-slice';
import {searchReducer} from '../features/search/search-slice';
import {sortCriteriaReducer} from '../features/sort-criteria/sort-criteria-slice';
import {triggerReducer} from '../features/triggers/triggers-slice';
import {undoable} from './undoable';

export const configuration = configurationReducer;
export const pagination = paginationReducer;
export const facetSet = facetSetReducer;
export const facetSearchSet = specificFacetSearchSetReducer;
export const search = searchReducer;
export const folding = foldingReducer;

export const dateFacetSet = dateFacetSetReducer;
export const relativeDateSet = relativeDateSetReducer;
export const facetOrder = facetOrderReducer;
export const numericFacetSet = numericFacetSetReducer;
export const categoryFacetSet = categoryFacetSetReducer;
export const facetOptions = facetOptionsReducer;
export const categoryFacetSearchSet = categoryFacetSearchSetReducer;
export const query = queryReducer;
export const advancedSearchQueries = advancedSearchQueriesReducer;
export const querySet = querySetReducer;
export const redirection = redirectionReducer;
export const querySuggest = querySuggestReducer;
export const sortCriteria = sortCriteriaReducer;
export const context = contextReducer;
export const didYouMean = didYouMeanReducer;
export const fields = fieldsReducer;
export const pipeline = pipelineReducer;
export const searchHub = searchHubReducer;
export const debug = debugReducer;
export const resultPreview = resultPreviewReducer;
export const version = versionReducer;
export const triggers = triggerReducer;
export const questionAnswering = questionAnsweringReducer;

export const history = undoable({
  actionTypes: {
    redo: redo.type,
    undo: undo.type,
    snapshot: snapshot.type,
  },
  reducer: historyReducer,
});
export const recommendation = recommendationReducer;
export const productRecommendations = productRecommendationsReducer;
