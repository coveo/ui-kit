import {
  twind,
  cssom,
  mo as observe,
  noop,
  type Sheet,
  defineConfig,
  Twind,
} from '@twind/core';
import presetAutoprefix from '@twind/preset-autoprefix';
import presetTailwind from '@twind/preset-tailwind';
import {supportsAdoptingStyleSheets} from './adoptedStyleSheets-utils';
import {getNonce} from './nonce';

const config = defineConfig({
  presets: [presetAutoprefix(), presetTailwind()],
});

// 1. Create separate adoptable sheet
const sheet = adoptable();

// 2. Use that to create an own twind instance
const tw = twind(config, sheet) as unknown as Twind;

// 3. One MutationObserver for all element instances
const observer = observe(tw);

export function getTwind() {
  return {
    tw,
    twOnConnected: (element: HTMLElement) => {
      sheet.connect(element), observer.observe(getShadowRoot(element));
    },
    twOnDisconnect: (element: HTMLElement) => sheet.disconnect(element),
  };
}

function getShadowRoot(element: HTMLElement): ShadowRoot {
  return element.shadowRoot || element.attachShadow({mode: 'open'});
}

interface AdoptableSheet extends Sheet<CSSStyleSheet> {
  connect(element: HTMLElement): void;
  disconnect(element: HTMLElement): void;
}

function adoptable(): AdoptableSheet {
  // TODO: search for SSR stylesheet
  if (supportsAdoptingStyleSheets) {
    try {
      // Try using adoptedStyleSheets — not supported in all browsers
      const sheet = cssom(new CSSStyleSheet()) as AdoptableSheet;

      sheet.connect = (element) => {
        const shadowRoot = getShadowRoot(element);
        shadowRoot.adoptedStyleSheets = [
          ...shadowRoot.adoptedStyleSheets!,
          sheet.target,
        ];
      };

      sheet.disconnect = noop;

      return sheet;
    } catch {
      // ignore — continue with fallback
    }
  }

  // Fallback: create a dedicated stylesheet for each element instance

  // Create our base stylesheet — its css rules will be copied to each element style
  const style = document.createElement('style');
  const nonce = getNonce();
  if (nonce) {
    style.setAttribute('nonce', nonce);
  }

  // Prevent this style sheet from being applied anywhere
  style.media = 'not all';
  document.head.prepend(style);

  const sheets = [cssom(style)];

  /** @type {WeakMap<HTMLElement, import('@twind/core').Sheet>} */
  const sheetsByElement = new WeakMap();

  return {
    get target() {
      return sheets[0].target;
    },

    snapshot() {
      const restores = sheets.map((sheet) => sheet.snapshot());
      return () => restores.forEach((restore) => restore());
    },

    clear() {
      sheets.forEach((sheets) => sheets.clear());
    },

    destroy() {
      sheets.forEach((sheets) => sheets.destroy());
    },

    insert(css, index, rule) {
      // We first insert the rule into our base sheet
      // This call will check (try-catch) and warn if necessary
      sheets[0].insert(css, index, rule);

      // For all connected sheets we insert the resulting rule directly
      // by-passing the try-catch block
      const cssRule = this.target.cssRules[index];
      sheets.forEach(
        (sheets, notFirst) =>
          notFirst && sheets.target.insertRule(cssRule.cssText, index)
      );
    },

    resume(addClassName, insert) {
      return sheets[0].resume(addClassName, insert);
    },

    connect(element) {
      const style = document.createElement('style');
      const nonce = getNonce();
      if (nonce) {
        style.setAttribute('nonce', nonce);
      }
      getShadowRoot(element).appendChild(style);

      const sheet = cssom(style);

      // Directly copy all rules from our base sheet
      const {cssRules} = this.target;
      for (let i = 0; i < cssRules.length; i++) {
        sheet.target.insertRule(cssRules[i].cssText, i);
      }

      sheets.push(sheet);
      sheetsByElement.set(element, sheet);
    },

    disconnect(element) {
      const index = sheets.indexOf(sheetsByElement.get(element));
      if (index >= 0) {
        sheets.splice(index, 1);
      }
    },
  };
}
