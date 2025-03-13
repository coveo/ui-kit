import {CSSResult} from 'lit';

export const injectStylesForNoShadowDOM = <
  T extends {
    styles: CSSResult;
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
      const styleSheet = Base.styles?.styleSheet;
      const isDocumentOrShadowRoot =
        parent instanceof Document || parent instanceof ShadowRoot;

      if (
        styleSheet &&
        isDocumentOrShadowRoot &&
        !parent.adoptedStyleSheets.includes(styleSheet)
      ) {
        parent.adoptedStyleSheets.push(styleSheet);
      }
    }
  };
};
