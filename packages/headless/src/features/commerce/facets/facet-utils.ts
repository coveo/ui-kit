import {AnyFacetValue} from './facet-set/interfaces/response';

export const isFacetValueSelected = (value: AnyFacetValue) => {
  return value.state === 'selected';
};

export const isFacetValueExcluded = (value: AnyFacetValue) => {
  return value.state === 'excluded';
};
