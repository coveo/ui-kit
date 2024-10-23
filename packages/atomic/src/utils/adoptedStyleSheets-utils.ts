import {getNonce} from './nonce';

const styleSheetMap = new Map<string, WeakRef<CSSStyleSheet>>();
const supportsAdoptingStyleSheets: boolean =
  globalThis.ShadowRoot &&
  'adoptedStyleSheets' in Document.prototype &&
  'replace' in CSSStyleSheet.prototype;

function getStyleSheet(styleSheet: string): CSSStyleSheet {
  let constructedStyleSheet: CSSStyleSheet | undefined;
  if (styleSheetMap.has(styleSheet)) {
    constructedStyleSheet = styleSheetMap.get(styleSheet)?.deref();
  }
  if (!constructedStyleSheet) {
    constructedStyleSheet = new CSSStyleSheet();
    constructedStyleSheet.replaceSync!(styleSheet);
  }
  return constructedStyleSheet;
}

// Thanks Lit, https://github.com/lit/lit/blob/main/packages/reactive-element/src/css-tag.ts#L170
export const adoptStyles = (renderRoot: ShadowRoot, styles: Array<string>) => {
  const dedupedStyles = new Set(styles);
  if (supportsAdoptingStyleSheets && renderRoot) {
    (renderRoot as ShadowRoot).adoptedStyleSheets = Array.from(
      dedupedStyles
    ).map((s) => getStyleSheet(s));
  } else {
    for (const s of dedupedStyles) {
      const style = document.createElement('style');
      const nonce = getNonce();
      if (nonce) {
        style.setAttribute('nonce', nonce);
      }
      style.textContent = s;
      renderRoot.appendChild(style);
    }
  }
};
