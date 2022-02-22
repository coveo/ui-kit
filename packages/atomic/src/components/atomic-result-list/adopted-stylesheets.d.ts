interface CssRule {
  cssText: string;
}

interface StyleSheet {
  cssRules: Record<string, CssRule>;
  replaceSync(content: string): void;
}

interface ShadowRoot {
  adoptedStyleSheets: StyleSheet[];
}
