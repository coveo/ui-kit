import {closest} from './dom-utils';

export const DEFAULT_MOBILE_BREAKPOINT = '1024px';

function replaceMediaQuery(style: string, mobileBreakpoint: string) {
  const regex = new RegExp(
    `\\(min-width: ${DEFAULT_MOBILE_BREAKPOINT}\\)|\\(width >= ${DEFAULT_MOBILE_BREAKPOINT}\\)`,
    'g'
  );
  return style.replace(regex, `(width >= ${mobileBreakpoint})`);
}

/**
 * Replaces the first adopted stylesheet of the element's shadow root with a copy that uses the
 * layout's breakpoint. The copy is adopted by this shadow root only: the original stylesheet is the
 * global Tailwind stylesheet that every component shares, so modifying it in place would change the
 * breakpoint of every component on the page.
 */
function replaceStyleSheet(element: HTMLElement, mobileBreakpoint: string) {
  const shadowRoot = element.shadowRoot;
  const [stylesheet, ...otherStylesheets] = shadowRoot?.adoptedStyleSheets ?? [];
  if (!shadowRoot || !stylesheet) {
    return;
  }

  const style = Object.values(stylesheet.cssRules)
    .map((rule) => rule.cssText)
    .join('');
  const replacedStylesheet = new CSSStyleSheet();
  replacedStylesheet.replaceSync(replaceMediaQuery(style, mobileBreakpoint));
  shadowRoot.adoptedStyleSheets = [replacedStylesheet, ...otherStylesheets];
}

function replateStyleContent(element: HTMLElement, breakpoint: string) {
  const styleTag = element.shadowRoot?.querySelector('style');
  if (!styleTag) {
    return;
  }

  styleTag.textContent = replaceMediaQuery(styleTag.textContent!, breakpoint);
}

const layouts = ['atomic-search-layout', 'atomic-insight-layout'];
type LayoutElement = HTMLElement & {mobileBreakpoint: string};
export function updateBreakpoints(element: HTMLElement) {
  const layout: LayoutElement | null = closest(element, layouts.join(', '));

  if (!layout?.mobileBreakpoint) {
    return;
  }

  if (layout.mobileBreakpoint === DEFAULT_MOBILE_BREAKPOINT) {
    return;
  }

  replaceStyleSheet(element, layout.mobileBreakpoint);
  replateStyleContent(element, layout.mobileBreakpoint);
}
