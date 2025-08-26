import type {CSSResultArray, CSSResultGroup, CSSResultOrNative} from 'lit';

/**
 * Decorator to inject styles into components that do not use Shadow DOM.
 *
 * This decorator is intended for LitElement-based components that render in the light DOM (i.e., without a shadow root).
 * It ensures that the component's styles (provided as static `styles` property) are injected into the document or shadow root using `adoptedStyleSheets`.
 *
 * Usage:
 *   @injectStylesForNoShadowDOM
 *   class MyComponent extends LitElement { ... }
 *
 * - Ensures styles are applied even when Shadow DOM is not used.
 * - Prevents duplicate style injection by checking for existing style sheets.
 * - Calls the original `connectedCallback` and `createRenderRoot` methods.
 *
 * @template T - A LitElement constructor with a static `styles` property.
 */
export const injectStylesForNoShadowDOM = <
  T extends {
    styles?: CSSResultGroup;
    // biome-ignore lint/suspicious/noExplicitAny: <>
    new (...args: any[]): any;
  },
>(
  Base: T
) => {
  return class extends Base {
    createRenderRoot() {
      return this;
    }

    public connectedCallback() {
      super.connectedCallback();
      this.injectStyles();
    }

    injectStyles() {
      const parent = this.getRootNode();
      const styles = Array.isArray(Base.styles) ? Base.styles : [Base.styles];
      const isDocumentOrShadowRoot =
        parent instanceof Document || parent instanceof ShadowRoot;

      if (isDocumentOrShadowRoot) {
        for (const style of styles) {
          const styleSheet = getStyleSheet(style);
          if (styleSheet && !parent.adoptedStyleSheets.includes(styleSheet)) {
            parent.adoptedStyleSheets.push(styleSheet);
          }
        }
      }
    }
  };
};

function getStyleSheet(
  style: CSSResultOrNative | CSSResultArray | null | undefined
): CSSStyleSheet | null {
  if (style instanceof CSSStyleSheet) {
    return style;
  }

  if (style && typeof style === 'object' && 'styleSheet' in style) {
    return (style as {styleSheet: CSSStyleSheet}).styleSheet;
  }

  return null;
}
