import {CSSResult, type CSSResultGroup, unsafeCSS} from 'lit';
import theme from '@/src/utils/coveo.tw.css';
import styles from '@/src/utils/tailwind.global.tw.css';
import utilities from '@/src/utils/tailwind-utilities/utilities.tw.css';

export function withTailwindStyles<
  T extends {
    styles?: CSSResultGroup | CSSStyleSheet | undefined;
    // biome-ignore lint/suspicious/noExplicitAny: <>
    new (...args: any[]): {};
  },
>(Base: T): T {
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
