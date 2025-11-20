import type {TermsToHighlight} from '@coveo/headless';

/**
 * @internal
 */
export class TextParser {
  constructor(private stemmingInfoFromIndex: TermsToHighlight) {}

  public parse(element: HTMLElement) {
    const innerTextOfHTMLElement = this.getHighlightedInnerText(element);
    return this.resolveOriginalTerm(innerTextOfHTMLElement).trim();
  }

  private isTaggedWord(element: HTMLElement) {
    return element.nodeName.toLowerCase() === 'coveotaggedword';
  }

  private getHighlightedInnerText(element: HTMLElement): string {
    if (!this.isTaggedWord(element)) {
      return this.getTextOfHTMLElement(element);
    }

    const children = Array.from(element.children) as HTMLElement[];
    if (children.length >= 1) {
      return this.getTextOfHTMLElement(children[0]);
    }

    return '';
  }

  private getTextOfHTMLElement(el: HTMLElement) {
    return el.innerText || el.textContent || '';
  }

  private resolveOriginalTerm(highlight: string): string {
    // First try to find either an exact match between the highlight and the original non-stemmed keyword.
    // Otherwise try to find a match between the highlight and the stemming keyword expansions
    // If nothing is found (which should not normally happen...), simply return the highlight keyword as is.

    const found = Object.keys(this.stemmingInfoFromIndex).find(
      (originalTerm) => {
        const originalTermMatch =
          originalTerm.toLowerCase() === highlight.toLowerCase();
        if (originalTermMatch) {
          return true;
        }
        const stemmingExpansions = this.stemmingInfoFromIndex[originalTerm];
        if (!stemmingExpansions) {
          return false;
        }

        const stemmingExpansionMatch = stemmingExpansions.find(
          (stemmingExpansion) =>
            stemmingExpansion.toLowerCase() === highlight.toLowerCase()
        );
        return stemmingExpansionMatch;
      }
    );
    return found || highlight;
  }
}
