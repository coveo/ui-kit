import {buildSearchLayoutCommon} from '../../common/atomic-layout-section/search-layout';

export function makeDesktopQuery(mobileBreakpoint: string) {
  return `only screen and (min-width: ${mobileBreakpoint})`;
}
export function buildCommerceLayout(
  element: HTMLElement,
  mobileBreakpoint: string
) {
  return buildSearchLayoutCommon(
    element,
    mobileBreakpoint,
    'atomic-commerce-layout',
    'atomic-commerce-interface'
  );
}
