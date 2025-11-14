import type {TermsToHighlight} from '@coveo/headless';
import {hsvToRgb, rgbToHsv} from '../../../../utils/color-utils';

export const HIGHLIGHT_PREFIX = 'CoveoHighlight';
export class QuickviewWordHighlight {
  public text: string;
  public indexIdentifier: string;
  public occurrences = 0;
  public color: string;
  public focusedColor: string;
  public previewBorderColor: string;
  public elements: HTMLElement[] = [];

  private currentNavigationPosition = -1;

  constructor(
    private stemmingInfoFromIndex: TermsToHighlight,
    keywordElementInIframe: HTMLElement
  ) {
    const parsed = this.parseKeywordIdentifier(keywordElementInIframe);
    if (!parsed) {
      throw 'Invalid keyword identifier for quickview';
    }

    this.text = this.getText(keywordElementInIframe);
    this.indexIdentifier = `${parsed.keywordIdentifier}`;
    this.color = keywordElementInIframe.style.backgroundColor;
    this.focusedColor = this.computeInvertedColor();
    this.previewBorderColor = this.computeSaturatedColor();

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
    currentElement.style.backgroundColor = this.focusedColor;
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
    return this.resolveOriginalTerm(innerTextOfHTMLElement).trim();
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
    const {r, g, b} = this.extractRgb();
    return `rgb(${255 - r}, ${255 - g}, ${255 - b})`;
  }

  private computeSaturatedColor() {
    const {r, g, b} = this.extractRgb();
    const {h, s, v} = rgbToHsv(r, g, b);
    let newSaturation = s * 2;
    if (newSaturation > 1) {
      newSaturation = 1;
    }
    const {
      r: rSaturated,
      g: gSaturated,
      b: bSaturated,
    } = hsvToRgb(h, newSaturation, v);
    return `rgb(${rSaturated}, ${gSaturated}, ${bSaturated})`;
  }

  private extractRgb() {
    const rgbExtracted = this.color.match(/\d+/g);
    if (!rgbExtracted) {
      return {r: 255, g: 255, b: 255};
    }

    return {
      r: parseInt(rgbExtracted[0], 10),
      g: parseInt(rgbExtracted[1], 10),
      b: parseInt(rgbExtracted[2], 10),
    };
  }
}

export const getWordsHighlights = (
  stemmingInfoFromIndex: TermsToHighlight,
  iframe?: HTMLIFrameElement
) => {
  const wordsHighlights: Record<string, QuickviewWordHighlight> = {};
  if (!iframe) {
    return wordsHighlights;
  }

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
        alreadyScannedKeyword.addElement(wordHTMLElementToHighlight);
      } else {
        wordsHighlights[wordHighlight.indexIdentifier] = wordHighlight;
      }
    });

  return wordsHighlights;
};
