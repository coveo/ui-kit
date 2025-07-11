import type {QueryCorrection} from '../../search/search/query-corrections.js';
import type {CommerceSuccessResponse} from '../common/response.js';

export interface SearchCommerceSuccessResponse extends CommerceSuccessResponse {
  queryCorrection?: SearchCommerceQueryCorrectionResponse;
}

interface SearchCommerceQueryCorrectionResponse {
  correctedQuery: string | null;
  corrections: QueryCorrection[];
  originalQuery: string | null;
}
