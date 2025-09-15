import {type CSSResult, type CSSResultGroup, unsafeCSS} from 'lit';
import theme from '@/src/utils/coveo.tw.css';
import styles from '@/src/utils/tailwind.global.tw.css';

const tailwindPropertiesSheet: CSSStyleSheet | null =
  typeof window !== 'undefined'
    ? (() => {
        const propCss = styles as unknown as string[] | string;
        const fullCss = Array.isArray(propCss) ? propCss.join('') : propCss;

        // Extract only the variable definitions inside @layer properties
        const match = fullCss.match(
          /@layer\s+properties\s*{[^{}]*@supports[^{}]*{([^}]*)}|@layer\s+properties\s*{([^}]*)}/
        );
        const cssString = (match?.[1] || match?.[2] || '').trim();
        if (!cssString) {
          return null;
        }
        const wrappedCss = `@layer properties { ${cssString} }`;
        const sheet = new CSSStyleSheet();
        sheet.replaceSync(wrappedCss);
        return sheet;
      })()
    : null;

// biome-ignore lint/suspicious/noExplicitAny: <>
function injectTailwindProperties(element: any) {
  if (typeof window === 'undefined' || !tailwindPropertiesSheet) return;

  const parent = element.getRootNode();
  const isParentDocumentOrShadowRoot =
    parent instanceof Document || parent instanceof ShadowRoot;

  if (isParentDocumentOrShadowRoot) {
    if (!parent.adoptedStyleSheets.includes(tailwindPropertiesSheet)) {
      parent.adoptedStyleSheets?.push(tailwindPropertiesSheet);
    }
  } else {
    element.adoptedStyleSheets?.push(tailwindPropertiesSheet);
  }
}

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
      const baseStyles: Array<CSSStyleSheet | CSSResult> = [
        unsafeCSS(theme),
        unsafeCSS(styles),
      ];

      const customStyles = Base.styles;

      if (Array.isArray(customStyles)) {
        return [...baseStyles, ...customStyles];
      }

      if (customStyles) {
        return [...baseStyles, customStyles];
      }

      return baseStyles;
    }
  };
};
