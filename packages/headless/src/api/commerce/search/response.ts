import type {QueryCorrection} from '../../search/search/query-corrections.js';
import type {PaginationWithResultTypeCounts} from '../common/pagination.js';
import type {CommerceSuccessResponse} from '../common/response.js';
import type {BaseResult} from '../common/result.js';

export interface SearchCommerceSuccessResponse extends CommerceSuccessResponse {
  queryCorrection?: SearchCommerceQueryCorrectionResponse;
  results: BaseResult[];
  pagination: PaginationWithResultTypeCounts;
}

interface SearchCommerceQueryCorrectionResponse {
  correctedQuery: string | null;
  corrections: QueryCorrection[];
  originalQuery: string | null;
}
