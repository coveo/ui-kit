import type {TermsToHighlight} from '@coveo/headless';
import {QuickviewWordHighlight} from './quickview-word-highlight';
import {TextParser} from './text-parser';

export const HIGHLIGHT_PREFIX = 'CoveoHighlight';

function findHighlightedElements(iframe?: HTMLIFrameElement): HTMLElement[] {
  const root = iframe?.contentDocument?.body;
  if (!root) return [];

  // Collect tagged word elements as well as elements whose id starts with
  // the highlight prefix. Tagged words (`<coveotaggedword>`) must be
  // considered so that invalid identifiers (e.g. id="invalid") are
  // discovered and cause the appropriate error in the parser.
  const selector = `[id^="${HIGHLIGHT_PREFIX}"]`;
  const query = root.querySelectorAll<HTMLElement>(selector);

  return Array.from(query);
}

/**
 * @internal
 */
export class IframeParser {
  private textParser = new TextParser(this.stemmingInfoFromIndex);
  private wordsHighlights: Record<string, QuickviewWordHighlight> = {};

  constructor(
    private stemmingInfoFromIndex: TermsToHighlight,
    private iframe?: HTMLIFrameElement
  ) {}

  public parse(): Record<string, QuickviewWordHighlight> {
    const elements = findHighlightedElements(this.iframe);
    for (const element of elements) {
      const identifier = this.parseIdentifier(element);
      if (!identifier) {
        throw new Error('Invalid keyword identifier for quickview');
      }

      const text = this.textParser.parse(element);
      if (!text) {
        continue;
      }

      const alreadyScannedKeyword = this.wordsHighlights[identifier];
      if (alreadyScannedKeyword) {
        alreadyScannedKeyword.addElement(element);
        continue;
      }

      const color = element.style.backgroundColor;
      const highlight = new QuickviewWordHighlight(
        identifier,
        text,
        color,
        element
      );
      this.wordsHighlights[identifier] = highlight;
    }

    return this.wordsHighlights;
  }

  private parseIdentifier(element: HTMLElement): string | null {
    const parts = element.id
      .substring(HIGHLIGHT_PREFIX.length + 1)
      .match(/^([0-9]+)\.([0-9]+)\.([0-9]+)$/);

    if (!parts || parts.length <= 3) {
      return null;
    }

    return parts[1];
  }
}

export const getWordsHighlights = (
  stemmingInfoFromIndex: TermsToHighlight,
  iframe?: HTMLIFrameElement
) => {
  const parser = new IframeParser(stemmingInfoFromIndex, iframe);
  return parser.parse();
};
