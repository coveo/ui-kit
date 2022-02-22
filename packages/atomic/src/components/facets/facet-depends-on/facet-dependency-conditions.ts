import {
  FacetValue,
  CategoryFacetValue,
  NumericFacetValue,
  DateFacetValue,
} from '@coveo/headless';
import {FacetRequestWithType} from './facet-union-types';

export type DependencyCondition = (state: FacetRequestWithType) => boolean;

export function buildFacetDependsOnAnyValueCondition(): DependencyCondition {
  return ({request}) => {
    return !!(
      request.currentValues as (
        | FacetValue
        | CategoryFacetValue
        | NumericFacetValue
        | DateFacetValue
      )[]
    ).find((value) => value.state === 'selected');
  };
}

export function buildFacetDependsOnSpecificValueCondition(
  expectedValue: string
): DependencyCondition {
  return (args) => {
    if (!buildFacetDependsOnAnyValueCondition()(args)) {
      return false;
    }
    if (args.type === 'facets' || args.type === 'categoryFacets') {
      return args.request.currentValues.some(
        (value) => value.state === 'selected' && expectedValue === value.value
      );
    }
    return true;
  };
}
