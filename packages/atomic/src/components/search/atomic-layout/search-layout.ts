import {buildSearchLayoutCommon} from '../../common/atomic-layout-section/search-layout';

export function makeDesktopQuery(mobileBreakpoint: string) {
  return `only screen and (min-width: ${mobileBreakpoint})`;
}
export function buildSearchLayout(
  element: HTMLElement,
  mobileBreakpoint: string
) {
  return buildSearchLayoutCommon(
    element,
    mobileBreakpoint,
    'atomic-search-layout',
    'atomic-search-interface'
  );
}
