function replaceMediaQuery(style: string, breakpoint: number) {
  return style.replace(
    /\(min-width: 1024px\)/g,
    `(min-width: ${breakpoint}px)`
  );
}

function replaceStyleSheet(element: HTMLElement, breakpoint: number) {
  // Not adopted by all browsers, not part of Typescript yet
  // https://caniuse.com/mdn-api_document_adoptedstylesheets
  // https://github.com/microsoft/TypeScript/issues/30022
  const stylesheets = (element.shadowRoot as any).adoptedStyleSheets;
  if (!stylesheets || !stylesheets.length) {
    return;
  }

  const stylesheet = stylesheets[0];
  const style = Object.values(stylesheet.cssRules)
    .map((rule: any) => rule.cssText)
    .join('');
  stylesheet.replaceSync(replaceMediaQuery(style, breakpoint));
}

function replateStyleContent(element: HTMLElement, breakpoint: number) {
  const styleTag = element.shadowRoot?.querySelector('style');
  if (!styleTag) {
    return;
  }

  styleTag.textContent = replaceMediaQuery(styleTag.textContent!, breakpoint);
}

const DEFAULT_BREAKPOINT = 1024;

export function updateBreakpoints(element: HTMLElement) {
  const layout = element.closest('atomic-search-layout');
  if (!layout) {
    return;
  }

  if (layout.breakpoint === DEFAULT_BREAKPOINT) {
    return;
  }

  replaceStyleSheet(element, layout.breakpoint);
  replateStyleContent(element, layout.breakpoint);
}
