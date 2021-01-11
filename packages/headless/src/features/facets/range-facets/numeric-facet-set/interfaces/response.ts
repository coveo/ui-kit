import {RangeValue} from '../../generic/interfaces/response';
import {BaseFacetResponse} from '../../../facet-api/response';

/**
 * @docsection Types
 */
export type NumericFacetValue = RangeValue<number>;
export type NumericFacetResponse = BaseFacetResponse<NumericFacetValue>;
