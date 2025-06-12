import {CSSResult} from 'lit';

export const injectStylesForNoShadowDOM = <
  T extends {
    styles: CSSResult | CSSResult[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
          const styleSheet = style?.styleSheet;
          if (styleSheet && !parent.adoptedStyleSheets.includes(styleSheet)) {
            parent.adoptedStyleSheets.push(styleSheet);
          }
        }
      }
    }
  };
};
