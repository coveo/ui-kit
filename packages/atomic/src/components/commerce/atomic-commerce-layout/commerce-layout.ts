import {buildCommonLayout} from '../../common/atomic-layout-section/layout';

export const layoutWebComponentTagName = 'atomic-commerce-layout';
export const containerWebComponentTagName = 'atomic-commerce-interface';
export const noProductsSelector = `${containerWebComponentTagName}-no-results`;
export const errorSelector = `${containerWebComponentTagName}-error`;
export const firstSearchExecutedSelector = `${containerWebComponentTagName}-search-executed`;

export function makeDesktopQuery(mobileBreakpoint: string) {
  return `only screen and (min-width: ${mobileBreakpoint})`;
}
export function buildCommerceLayout(
  element: HTMLElement,
  mobileBreakpoint: string
) {
  return buildCommonLayout(
    element,
    mobileBreakpoint,
    layoutWebComponentTagName,
    containerWebComponentTagName,
    noProductsSelector,
    errorSelector,
    'atomic-commerce-refine-toggle',
    'atomic-commerce-sort-dropdown'
  );
}
