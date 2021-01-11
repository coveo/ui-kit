import {RangeValue} from '../../generic/interfaces/response';
import {BaseFacetResponse} from '../../../facet-api/response';

/**
 * @docsection Types
 */
export type DateFacetValue = RangeValue<string>;
export type DateFacetResponse = BaseFacetResponse<DateFacetValue>;
