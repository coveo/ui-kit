import {closest} from './dom-utils';

export const DEFAULT_MOBILE_BREAKPOINT = '1024px';

function replaceMediaQuery(style: string, mobileBreakpoint: string) {
  const regex = new RegExp(
    `\\(min-width: ${DEFAULT_MOBILE_BREAKPOINT}\\)|\\(width >= ${DEFAULT_MOBILE_BREAKPOINT}\\)`,
    'g'
  );
  return style.replace(regex, `(width >= ${mobileBreakpoint})`);
}

function replaceStyleSheet(element: HTMLElement, mobileBreakpoint: string) {
  const stylesheets = element.shadowRoot?.adoptedStyleSheets;
  if (!stylesheets || !stylesheets.length) {
    return;
  }

  const stylesheet = stylesheets[0];
  const style = Object.values(stylesheet.cssRules)
    .map((rule) => rule.cssText)
    .join('');
  stylesheet.replaceSync(replaceMediaQuery(style, mobileBreakpoint));
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
