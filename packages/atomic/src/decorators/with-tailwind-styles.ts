import {CSSResult, CSSResultGroup, unsafeCSS} from 'lit';
import theme from '@/src/utils/coveo.tw.css';
import styles from '@/src/utils/tailwind.global.tw.css';
import utilities from '@/src/utils/tailwind-utilities/utilities.tw.css';

export function withTailwindStyles<
  T extends {
    styles?: CSSResultGroup | CSSStyleSheet | undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    new (...args: any[]): {};
  },
>(constructor: T): T {
  return class extends constructor {
    static get styles(): CSSResultGroup {
      const baseStyles = [
        unsafeCSS(theme),
        unsafeCSS(styles),
        unsafeCSS(utilities),
      ];
      const customStyles = super.styles;

      if (customStyles instanceof CSSResult) {
        return [...baseStyles, customStyles];
      } else if (Array.isArray(customStyles)) {
        return [...baseStyles, ...customStyles];
      }
      return baseStyles;
    }
  };
}
