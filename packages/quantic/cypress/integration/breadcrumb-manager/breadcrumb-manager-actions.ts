import {
  BreadcrumbManagerSelector,
  BreadcrumbManagerSelectors,
} from './breadcrumb-manager-selectors';

function breadcrumbManagerActions(selector: BreadcrumbManagerSelector) {
  return {};
}

export const SortActions = {
  ...breadcrumbManagerActions(BreadcrumbManagerSelectors),
};
