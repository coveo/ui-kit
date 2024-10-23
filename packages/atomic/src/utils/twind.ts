import {setup, cssom, defineConfig, Twind} from '@twind/core';
import presetAutoprefix from '@twind/preset-autoprefix';
import presetTailwind from '@twind/preset-tailwind';
import {supportsAdoptingStyleSheets} from './adoptedStyleSheets-utils';
import {getNonce} from './nonce';

const config = defineConfig({
  presets: [presetAutoprefix(), presetTailwind()],
});

export const getTwind = (renderRoot: ShadowRoot) => {
  let stylesheetOrElement: CSSStyleSheet | HTMLStyleElement;
  if (supportsAdoptingStyleSheets && renderRoot) {
    stylesheetOrElement = new CSSStyleSheet();
    renderRoot.adoptedStyleSheets?.push(stylesheetOrElement);
  } else {
    stylesheetOrElement = document.createElement('style');
    const nonce = getNonce();
    if (nonce) {
      stylesheetOrElement.setAttribute('nonce', nonce);
    }
    renderRoot.appendChild(stylesheetOrElement);
  }
  const tw = setup(config, cssom(stylesheetOrElement));
  return tw as unknown as Twind;
};
