import {CSSResult, type CSSResultGroup, unsafeCSS} from 'lit';
import theme from '@/src/utils/coveo.tw.css';
import styles from '@/src/utils/tailwind.global.tw.css';
import utilities from '@/src/utils/tailwind-utilities/utilities.tw.css';

let tailwindPropertiesInjected = false;

function injectTailwindProperties() {
  if (tailwindPropertiesInjected) return;
  const propCss = styles as unknown as string[] | string;
  const fullCss = Array.isArray(propCss) ? propCss.join('') : propCss;

  // Extract only the variable definitions inside @layer properties
  const match = fullCss.match(
    /@layer\s+properties\s*{[^{}]*@supports[^{}]*{([^}]*)}|@layer\s+properties\s*{([^}]*)}/
  );
  const cssString = (match?.[1] || match?.[2] || '').trim();
  const styleEl = document.createElement('style');
  styleEl.textContent = `/* tailwind properties */${cssString}`;
  document.head.appendChild(styleEl);
  tailwindPropertiesInjected = true;
}

export function withTailwindStyles<
  T extends {
    styles?: CSSResultGroup | CSSStyleSheet | undefined;
    // biome-ignore lint/suspicious/noExplicitAny: <>
    new (...args: any[]): {};
  },
>(Base: T): T {
  injectTailwindProperties();

  return class extends Base {
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
}
