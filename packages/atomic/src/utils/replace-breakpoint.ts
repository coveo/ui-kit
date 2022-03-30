const DEFAULT_MOBILE_BREAKPOINT = '1024px';

function replaceMediaQuery(style: string, mobileBreakpoint: string) {
  return style.replace(
    new RegExp(`\\(min-width: ${DEFAULT_MOBILE_BREAKPOINT}\\)`, 'g'),
    `(min-width: ${mobileBreakpoint})`
  );
}

function replaceStyleSheet(element: HTMLElement, mobileBreakpoint: string) {
  // Not adopted by all browsers, not part of Typescript yet
  // https://caniuse.com/mdn-api_document_adoptedstylesheets
  // https://github.com/microsoft/TypeScript/issues/30022
  const stylesheets = element.shadowRoot?.adoptedStyleSheets;
  if (!stylesheets || !stylesheets.length) {
    return;
  }

  const stylesheet = stylesheets[0];
  const style = Object.values(stylesheet.cssRules)
    .map((rule) => rule.cssText)
    .join('');
  stylesheet.replaceSync?.(replaceMediaQuery(style, mobileBreakpoint));
}

function replateStyleContent(element: HTMLElement, breakpoint: string) {
  const styleTag = element.shadowRoot?.querySelector('style');
  if (!styleTag) {
    return;
  }

  styleTag.textContent = replaceMediaQuery(styleTag.textContent!, breakpoint);
}

export function updateBreakpoints(element: HTMLElement) {
  const layout = element.closest('atomic-search-layout');
  if (!layout) {
    return;
  }

  if (layout.mobileBreakpoint === DEFAULT_MOBILE_BREAKPOINT) {
    return;
  }

  replaceStyleSheet(element, layout.mobileBreakpoint);
  replateStyleContent(element, layout.mobileBreakpoint);
}
