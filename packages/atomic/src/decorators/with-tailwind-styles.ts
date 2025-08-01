import {CSSResult, type CSSResultGroup, unsafeCSS} from 'lit';
import theme from '@/src/utils/coveo.tw.css';
import styles from '@/src/utils/tailwind.global.tw.css';
import utilities from '@/src/utils/tailwind-utilities/utilities.tw.css';

const tailwindPropertiesSheet = (() => {
  const propCss = styles as unknown as string[] | string;
  const fullCss = Array.isArray(propCss) ? propCss.join('') : propCss;

  // Extract only the variable definitions inside @layer properties
  const match = fullCss.match(
    /@layer\s+properties\s*{[^{}]*@supports[^{}]*{([^}]*)}|@layer\s+properties\s*{([^}]*)}/
  );
  const cssString = (match?.[1] || match?.[2] || '').trim();
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(cssString);
  return sheet;
})();

// biome-ignore lint/suspicious/noExplicitAny: <>
function injectTailwindProperties(element: any) {
  if (typeof document === 'undefined') return;

  const parent = element.getRootNode();
  const isDocumentOrShadowRoot =
    parent instanceof Document || parent instanceof ShadowRoot;

  if (isDocumentOrShadowRoot) {
    if (!parent.adoptedStyleSheets.includes(tailwindPropertiesSheet)) {
      parent.adoptedStyleSheets.push(tailwindPropertiesSheet);
    }
  } else {
    element.adoptedStyleSheets.push(tailwindPropertiesSheet);
  }
}

injectTailwindProperties(document);

export const withTailwindStyles = <
  T extends {
    styles?: CSSResultGroup | CSSStyleSheet | undefined;
    // biome-ignore lint/suspicious/noExplicitAny: <>
    new (...args: any[]): any;
  },
>(
  Base: T
): T => {
  return class extends Base {
    public connectedCallback() {
      super.connectedCallback();
      injectTailwindProperties(this);
    }
    static get styles(): CSSResultGroup {
      const baseStyles = [
        unsafeCSS(theme),
        unsafeCSS(styles),
        unsafeCSS(utilities),
      ];
      const customStyles = Base.styles;

      if (customStyles instanceof CSSResult) {
        return [...baseStyles, customStyles];
      } else if (Array.isArray(customStyles)) {
        return [...baseStyles, ...customStyles];
      }
      return baseStyles;
    }
  };
};
