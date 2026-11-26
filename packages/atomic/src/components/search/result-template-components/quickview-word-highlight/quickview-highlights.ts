import type {HighlightKeywords} from '@/src/components/search/atomic-quickview-modal/highlight-keywords';
import {HIGHLIGHT_PREFIX, type QuickviewWordHighlight} from './quickview-word-highlight';

type IframeWindow = Window & typeof globalThis;

/**
 * Paints the quickview keywords with the CSS Custom Highlight API inside the
 * quickview iframe, so that toggling and navigating keywords never touches the
 * document's DOM.
 *
 * @internal
 */
export class QuickviewHighlights {
  private document?: Document;
  private styleSheet?: CSSStyleSheet;
  private words: QuickviewWordHighlight[] = [];

  public attach(iframe: HTMLIFrameElement, words: Record<string, QuickviewWordHighlight>) {
    this.detach();

    const document = iframe.contentDocument;
    const window = document?.defaultView as IframeWindow | null | undefined;
    if (!document || !window?.CSS?.highlights) {
      return;
    }

    this.document = document;
    this.words = Object.values(words);
    this.styleSheet = new window.CSSStyleSheet();
    this.styleSheet.replaceSync(
      [
        `[id^="${HIGHLIGHT_PREFIX}"] {
          background-color: transparent !important;
          color: inherit !important;
        }`,
        ...this.words.map((word) => word.styles),
      ].join('\n')
    );
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, this.styleSheet];
  }

  public update(highlightKeywords: HighlightKeywords) {
    const registry = this.registry;
    if (!registry) {
      return;
    }

    for (const word of this.words) {
      const enabled =
        !highlightKeywords.highlightNone &&
        highlightKeywords.keywords[word.text]?.enabled !== false;

      if (enabled) {
        registry.set(word.highlightName, word.highlight);
        registry.set(word.focusedHighlightName, word.focusedHighlight);
      } else {
        registry.delete(word.highlightName);
        registry.delete(word.focusedHighlightName);
      }
    }
  }

  public detach() {
    const registry = this.registry;
    for (const word of this.words) {
      registry?.delete(word.highlightName);
      registry?.delete(word.focusedHighlightName);
    }

    if (this.document && this.styleSheet) {
      this.document.adoptedStyleSheets = this.document.adoptedStyleSheets.filter(
        (sheet) => sheet !== this.styleSheet
      );
    }

    this.document = undefined;
    this.styleSheet = undefined;
    this.words = [];
  }

  private get registry() {
    return (this.document?.defaultView as IframeWindow | null | undefined)?.CSS.highlights;
  }
}
