import {TermsToHighlight} from '@coveo/headless';

const HIGHLIGHT_PREFIX = 'CoveoHighlight';
export class QuickviewWordHighlight {
  public text: string;
  public indexIdentifier: string;
  public occurrences = 0;
  public color: string;
  public invertColor: string;

  private currentNavigationPosition = -1;
  private elements: HTMLElement[] = [];

  constructor(
    private stemmingInfoFromIndex: TermsToHighlight,
    keywordElementInIframe: HTMLElement
  ) {
    const parsed = this.parseKeywordIdentifier(keywordElementInIframe);
    if (!parsed) {
      throw 'Invalid keyword identifier for quickview';
    }

    this.indexIdentifier = parsed.keywordIdentifier;
    this.text = this.getText(keywordElementInIframe);
    this.color = keywordElementInIframe.style.backgroundColor;
    this.invertColor = this.computeInvertedColor();

    this.addElement(keywordElementInIframe);
  }

  public addElement(keywordElementInIframe: HTMLElement) {
    this.occurrences++;
    this.elements.push(keywordElementInIframe);
  }

  public navigateForward() {
    this.currentNavigationPosition++;
    if (this.currentNavigationPosition >= this.elements.length) {
      this.currentNavigationPosition = 0;
    }
    this.highlightNavigation();
    this.putElementIntoView();
    return this.elements[this.currentNavigationPosition];
  }

  public navigateBackward() {
    this.currentNavigationPosition--;
    if (this.currentNavigationPosition < 0) {
      this.currentNavigationPosition = this.elements.length - 1;
    }
    this.highlightNavigation();
    this.putElementIntoView();
    return this.elements[this.currentNavigationPosition];
  }

  private isTaggedWord(element: HTMLElement) {
    return element.nodeName.toLowerCase() === 'coveotaggedword';
  }

  private highlightNavigation() {
    const currentElement = this.elements[this.currentNavigationPosition];
    const otherElements = this.elements.filter((el) => el !== currentElement);
    currentElement.style.color = this.color;
    currentElement.style.backgroundColor = this.invertColor;
    otherElements.forEach((element) => {
      element.style.color = '';
      element.style.backgroundColor = this.color;
    });
  }

  private putElementIntoView() {
    const element = this.elements[this.currentNavigationPosition];
    element.scrollIntoView();
  }

  private getText(element: HTMLElement) {
    const innerTextOfHTMLElement = this.getHighlightedInnerText(element);
    return this.resolveOriginalTerm(innerTextOfHTMLElement);
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

  private parseKeywordIdentifier(element: HTMLElement) {
    const parts = element.id
      .substring(HIGHLIGHT_PREFIX.length + 1)
      .match(/^([0-9]+)\.([0-9]+)\.([0-9]+)$/);

    if (!parts || parts.length <= 3) {
      return null;
    }

    return {
      keywordIdentifier: parts[1],
      keywordTermPart: parseInt(parts[3], 10),
    };
  }

  private getTextOfHTMLElement(el: HTMLElement) {
    return el.innerText || el.textContent || '';
  }

  private computeInvertedColor() {
    const rgbExtracted = this.color.match(/\d+/g);
    if (!rgbExtracted) {
      return 'white';
    }

    const r = parseInt(rgbExtracted[0], 10);
    const g = parseInt(rgbExtracted[1], 10);
    const b = parseInt(rgbExtracted[2], 10);
    return `rgb(${255 - r}, ${255 - g}, ${255 - b})`;
  }
}

export const getWordsHighlights = (
  iframe: HTMLIFrameElement,
  stemmingInfoFromIndex: TermsToHighlight
) => {
  const wordsHighlights: Record<string, QuickviewWordHighlight> = {};

  iframe.contentDocument?.body
    .querySelectorAll(`[id^="${HIGHLIGHT_PREFIX}"]`)
    .forEach((el) => {
      const wordHTMLElementToHighlight = el as HTMLElement;

      const wordHighlight = new QuickviewWordHighlight(
        stemmingInfoFromIndex,
        wordHTMLElementToHighlight
      );

      if (!wordHighlight.text) {
        return;
      }

      const alreadyScannedKeyword =
        wordsHighlights[wordHighlight.indexIdentifier];

      if (alreadyScannedKeyword) {
        addNewWordElementToExistingHighlights(
          alreadyScannedKeyword,
          wordHighlight,
          el as HTMLElement
        );
      } else {
        wordsHighlights[wordHighlight.indexIdentifier] = wordHighlight;
      }
    });

  return wordsHighlights;
};

const addNewWordElementToExistingHighlights = (
  existingHighlight: QuickviewWordHighlight,
  newWordHighlight: QuickviewWordHighlight,
  newWordElement: HTMLElement
) => {
  existingHighlight.addElement(newWordElement as HTMLElement);

  // Special code needed to workaround invalid HTML returned by the index with embedded keyword
  if (existingHighlight.occurrences === newWordHighlight.occurrences) {
    existingHighlight.text += newWordHighlight.text;
  }
};
