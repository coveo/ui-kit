import theme from '@/src/utils/coveo.tw.css';
import utilities from '@/src/utils/tailwind-utilities/utilities.tw.css';
import styles from '@/src/utils/tailwind.global.tw.css';
import {CSSResult, type CSSResultGroup, unsafeCSS} from 'lit';

export function withTailwindStyles<
  T extends {
    styles?: CSSResultGroup | CSSStyleSheet | undefined;
    // biome-ignore lint/suspicious/noExplicitAny: Acceptable for mixin constructor
    new (...args: any[]): {};
  },
>(baseClass: T): T {
  return class extends baseClass {
    static get styles(): CSSResultGroup {
      const baseStyles = [
        unsafeCSS(theme),
        unsafeCSS(styles),
        unsafeCSS(utilities),
      ];
      baseClass;
      const customStyles = baseClass.styles;

      if (customStyles instanceof CSSResult) {
        return [...baseStyles, customStyles];
      } else if (Array.isArray(customStyles)) {
        return [...baseStyles, ...customStyles];
      }
      return baseStyles;
    }
  };
}
