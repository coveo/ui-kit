import {RangeValue} from '../../generic/interfaces/response';
import {BaseFacetResponse} from '../../../facet-api/response';

export type NumericFacetValue = RangeValue<number>;
export type NumericFacetResponse = BaseFacetResponse<NumericFacetValue>;
