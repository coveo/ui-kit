import {QueryCorrection} from '../../search/search/query-corrections.js';
import {CommerceSuccessResponse} from '../common/response.js';

export interface SearchCommerceSuccessResponse extends CommerceSuccessResponse {
  queryCorrection?: SearchCommerceQueryCorrectionResponse;
}

interface SearchCommerceQueryCorrectionResponse {
  correctedQuery: string | null;
  corrections: QueryCorrection[];
  originalQuery: string | null;
}
