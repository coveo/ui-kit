import {BaseParam} from '../../platform-service-params';
import {
  ConstantQueryOverrideParam,
  FieldParam,
  MaximumNumberOfValuesParam,
  SortCriteriaParam,
  QueryOverrideParam,
  PatternParam,
} from '../search-api-params';

export type FieldValuesRequest = BaseParam &
  FieldParam &
  Partial<
    SortCriteriaParam &
      MaximumNumberOfValuesParam &
      QueryOverrideParam &
      ConstantQueryOverrideParam &
      PatternParam
  >;
