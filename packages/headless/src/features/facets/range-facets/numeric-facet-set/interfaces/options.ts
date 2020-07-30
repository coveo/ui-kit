import {
  ManualRangeFacetOptions,
  AutomaticRangeFacetOptions,
} from '../../generic/interfaces/options';
import {NumericFacetRequest} from './request';

type ManualNumericFacetOptions = ManualRangeFacetOptions<NumericFacetRequest>;
type AutomaticNumericFacetOptions = AutomaticRangeFacetOptions<
  NumericFacetRequest
>;

export type NumericFacetRegistrationOptions =
  | ManualNumericFacetOptions
  | AutomaticNumericFacetOptions;
