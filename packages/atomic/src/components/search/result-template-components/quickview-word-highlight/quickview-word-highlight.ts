import {ColorParser} from './color-parser';

export {getWordsHighlights, HIGHLIGHT_PREFIX} from './iframe-parser';

export class QuickviewWordHighlight {
  public readonly focusedColor: string;
  public readonly previewBorderColor: string;
  public readonly elements: HTMLElement[] = [];

  private currentNavigationPosition = -1;

  constructor(
    public readonly indexIdentifier: string,
    public readonly text: string,
    public readonly color: string,
    element: HTMLElement
  ) {
    this.addElement(element);

    const colorParser = new ColorParser(color);
    this.focusedColor = colorParser.rgbInverted();
    this.previewBorderColor = colorParser.rgbSaturated();
  }

  public addElement(element: HTMLElement) {
    this.elements.push(element);
  }

  public get occurrences() {
    return this.elements.length;
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
}
