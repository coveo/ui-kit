import type {CommerceSearchParameters} from '../search-parameters/search-parameters-actions.js';

export interface CommerceParametersState extends CommerceSearchParameters {}

export function getCommerceParametersInitialState(): CommerceParametersState {
  return {};
}
