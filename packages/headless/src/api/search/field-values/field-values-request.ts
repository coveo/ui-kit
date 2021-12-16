import {BaseParam} from '../../platform-service-params';
import {
  ContantQueryOverrideParam,
  FieldParam,
  MaximumNumberOfValuesParam,
  SortCriteriaParam,
  QueryOverrideParam,
} from '../search-api-params';

export type FieldValuesRequest = BaseParam &
  FieldParam &
  SortCriteriaParam &
  MaximumNumberOfValuesParam &
  QueryOverrideParam &
  ContantQueryOverrideParam;
