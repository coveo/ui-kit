import {
  ManualRangeFacetOptions,
  AutomaticRangeFacetOptions,
} from '../../generic/interfaces/options';
import {DateFacetRequest} from './request';

type ManualDateFacetOptions = ManualRangeFacetOptions<DateFacetRequest>;
type AutomaticDateFacetOptions = AutomaticRangeFacetOptions<DateFacetRequest>;

export type DateFacetRegistrationOptions =
  | ManualDateFacetOptions
  | AutomaticDateFacetOptions;
