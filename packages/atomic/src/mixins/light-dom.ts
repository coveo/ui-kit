import type {
  CSSResultArray,
  CSSResultGroup,
  CSSResultOrNative,
  LitElement,
} from 'lit';
import type {Constructor} from './mixin-common.js';

declare class LightDomMixinInterface {
  injectStyles(dynamicStyles?: CSSResultGroup): Promise<void>;
}

/**
 * Mixin that provides dynamic styles injection functionality for components that do not use Shadow DOM.
 *
 * Usage:
 *   class MyComponent extends LightDomMixin(LitElement) {
 *     static styles = css`div { color: blue; }`;
 *     render() { return html`<div>content</div>`; }
 *   }
 *
 * Features:
 * - Automatically injects static styles from the component's `styles` property in `connectedCallback`
 * - Exposes an `injectStyles` method that can be called manually with dynamic styles
 * - Prevents duplicate style injection by checking for existing style sheets
 * - Overrides `createRenderRoot` to return `this` (disabling Shadow DOM)
 *
 * @param superClass - The base class to extend (must be a LitElement constructor)
 * @returns A class that extends the superClass with dynamic styles injection functionality
 */
export const LightDomMixin = <T extends Constructor<LitElement>>(
  superClass: T
) => {
  class LightDomMixinClass extends superClass {
    protected createRenderRoot() {
      return this;
    }

    connectedCallback() {
      super.connectedCallback();
      this.injectStyles();
    }

    /**
     * Injects styles into the document or shadow root.
     *
     * When called without arguments, injects the component's static styles.
     * When called with dynamic styles, injects both static and dynamic styles.
     *
     * @param dynamicStyles - Optional dynamic styles to inject along with static styles
     */
    async injectStyles(dynamicStyles?: CSSResultGroup) {
      const parent = this.getRootNode();
      const isDocumentOrShadowRoot =
        parent instanceof Document || parent instanceof ShadowRoot;

      if (!isDocumentOrShadowRoot) {
        return;
      }

      const constructorStyles = (this.constructor as typeof LitElement).styles;
      const staticStyles = Array.isArray(constructorStyles)
        ? constructorStyles
        : [constructorStyles];

      const dynamicStylesArray = Array.isArray(dynamicStyles)
        ? dynamicStyles
        : [dynamicStyles];

      const allStyles = [...staticStyles, ...dynamicStylesArray];

      for (const style of allStyles) {
        if (style) {
          const styleSheet = this.getStyleSheet(style);
          if (styleSheet && !parent.adoptedStyleSheets.includes(styleSheet)) {
            parent.adoptedStyleSheets.push(styleSheet);
          }
        }
      }
    }

    private getStyleSheet(
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
  }

  return LightDomMixinClass as Constructor<LightDomMixinInterface> & T;
};
