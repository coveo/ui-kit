import {InterceptAliases} from '../../page-objects/search';
import {SearchExpectations} from '../search-expectations';
import {
  BreadcrumbManagerSelector,
  BreadcrumbManagerSelectors,
} from './breadcrumb-manager-selectors';

function breadcrumbManagerExpectations(selector: BreadcrumbManagerSelector) {
  return {};
}

export const BreadcrumbManagerExpectations = {
  ...breadcrumbManagerExpectations(BreadcrumbManagerSelectors),
  search: {
    ...SearchExpectations,
  },
};
