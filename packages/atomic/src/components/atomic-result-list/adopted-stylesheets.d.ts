interface CSSStyleSheet {
  replaceSync(content: string): void;
}

interface ShadowRoot {
  adoptedStyleSheets: CSSStyleSheet[];
}
