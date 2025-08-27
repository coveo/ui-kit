import {buildCommonLayout} from '../../common/atomic-layout-section/layout';

export const layoutWebComponentTagName = 'atomic-search-layout';
export const containerWebComponentTagName = 'atomic-search-interface';
export const noResultsSelector = `${containerWebComponentTagName}-no-results`;
export const errorSelector = `${containerWebComponentTagName}-error`;
export const firstSearchExecutedSelector = `${containerWebComponentTagName}-search-executed`;

export function makeDesktopQuery(mobileBreakpoint: string) {
  return `only screen and (min-width: ${mobileBreakpoint})`;
}
export function buildSearchLayout(
  element: HTMLElement,
  mobileBreakpoint: string
) {
  return buildCommonLayout(
    element,
    mobileBreakpoint,
    layoutWebComponentTagName,
    containerWebComponentTagName,
    noResultsSelector,
    errorSelector,
    'atomic-refine-toggle',
    'atomic-sort-dropdown'
  );
}
