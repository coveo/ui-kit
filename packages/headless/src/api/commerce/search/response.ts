import {Correction} from '../../search/search/query-corrections';
import {CommerceSuccessResponse} from '../common/response';

export interface SearchCommerceSuccessResponse extends CommerceSuccessResponse {
  queryCorrection?: Correction;
}
