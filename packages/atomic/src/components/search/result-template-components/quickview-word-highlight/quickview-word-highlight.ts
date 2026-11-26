import {ColorParser} from './color-parser';

export {getWordsHighlights, HIGHLIGHT_PREFIX} from './iframe-parser';

const HIGHLIGHT_NAME_PREFIX = 'coveo-quickview-keyword';

type HighlightConstructor = typeof Highlight;

function getHighlightConstructor(element: HTMLElement): HighlightConstructor {
  // A highlight is only painted by the registry of its own realm, so build it
  // with the constructor of the window that owns the element (the iframe).
  const view = element.ownerDocument.defaultView as (Window & typeof globalThis) | null;
  return view?.Highlight ?? Highlight;
}

function createRange(element: HTMLElement) {
  const range = element.ownerDocument.createRange();
  range.selectNodeContents(element);
  return range;
}

export class QuickviewWordHighlight {
  public readonly focusedColor: string;
  public readonly previewBorderColor: string;
  public readonly elements: HTMLElement[] = [];
  public readonly highlightName: string;
  public readonly focusedHighlightName: string;
  public readonly highlight: Highlight;
  public readonly focusedHighlight: Highlight;

  private readonly ranges: Range[] = [];
  private currentNavigationPosition = -1;

  constructor(
    public readonly indexIdentifier: string,
    public readonly text: string,
    public readonly color: string,
    element: HTMLElement
  ) {
    const HighlightInRealm = getHighlightConstructor(element);
    this.highlight = new HighlightInRealm();
    this.focusedHighlight = new HighlightInRealm();
    this.focusedHighlight.priority = 1;
    this.highlightName = `${HIGHLIGHT_NAME_PREFIX}-${indexIdentifier}`;
    this.focusedHighlightName = `${this.highlightName}-focused`;

    this.addElement(element);

    const colorParser = new ColorParser(color);
    this.focusedColor = colorParser.rgbInverted();
    this.previewBorderColor = colorParser.rgbSaturated();
  }

  public addElement(element: HTMLElement) {
    const range = createRange(element);
    this.elements.push(element);
    this.ranges.push(range);
    this.highlight.add(range);
  }

  public get occurrences() {
    return this.elements.length;
  }

  public get styles() {
    return `::highlight(${this.highlightName}) {
      background-color: ${this.color};
    }
    ::highlight(${this.focusedHighlightName}) {
      color: ${this.color};
      background-color: ${this.focusedColor};
    }`;
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
    this.focusedHighlight.clear();
    this.focusedHighlight.add(this.ranges[this.currentNavigationPosition]);
  }

  private putElementIntoView() {
    const element = this.elements[this.currentNavigationPosition];
    element.scrollIntoView();
  }
}
