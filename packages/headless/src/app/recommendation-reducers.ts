import {debugReducer} from '../features/debug/debug-slice';
import {pipelineReducer} from '../features/pipeline/pipeline-slice';
import {recommendationReducer} from '../features/recommendation/recommendation-slice';
import {searchReducer} from '../features/search/search-slice';

export const recommendation = recommendationReducer;
export const debug = debugReducer;
export const pipeline = pipelineReducer;
export const searchHub = searchReducer;
