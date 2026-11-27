import {ColorParser} from './color-parser';

const HIGHLIGHT_NAME_PREFIX = 'coveo-quickview-keyword';

type IframeWindow = Window & typeof globalThis;

function getView(range: Range) {
  return range.startContainer.ownerDocument?.defaultView as IframeWindow | null | undefined;
}

function scrollRangeIntoView(range: Range) {
  range.startContainer.parentElement?.scrollIntoView({block: 'nearest'});

  const view = getView(range);
  if (!view) {
    return;
  }
  const {top, bottom} = range.getBoundingClientRect();
  if (top < 0 || bottom > view.innerHeight) {
    view.scrollBy(0, top - view.innerHeight / 2);
  }
}

export class QuickviewWordHighlight {
  public readonly focusedColor: string;
  public readonly previewBorderColor: string;
  public readonly highlightName: string;
  public readonly focusedHighlightName: string;
  public readonly highlight: Highlight;
  public readonly focusedHighlight: Highlight;

  private currentNavigationPosition = -1;

  constructor(
    public readonly indexIdentifier: string,
    public readonly text: string,
    public readonly color: string,
    public readonly ranges: Range[]
  ) {
    // A highlight is only painted by the registry of its own realm, so build it
    // with the constructor of the window that owns the ranges (the iframe).
    const HighlightInRealm = (ranges[0] && getView(ranges[0])?.Highlight) || Highlight;
    this.highlight = new HighlightInRealm(...ranges);
    this.focusedHighlight = new HighlightInRealm();
    this.focusedHighlight.priority = 1;
    this.highlightName = `${HIGHLIGHT_NAME_PREFIX}-${indexIdentifier}`;
    this.focusedHighlightName = `${this.highlightName}-focused`;

    const colorParser = new ColorParser(color);
    this.focusedColor = colorParser.rgbInverted();
    this.previewBorderColor = colorParser.rgbSaturated();
  }

  public get occurrences() {
    return this.ranges.length;
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
    if (this.currentNavigationPosition >= this.ranges.length) {
      this.currentNavigationPosition = 0;
    }
    return this.focusCurrentRange();
  }

  public navigateBackward() {
    this.currentNavigationPosition--;
    if (this.currentNavigationPosition < 0) {
      this.currentNavigationPosition = this.ranges.length - 1;
    }
    return this.focusCurrentRange();
  }

  private focusCurrentRange() {
    const range = this.ranges[this.currentNavigationPosition];
    this.focusedHighlight.clear();
    this.focusedHighlight.add(range);
    scrollRangeIntoView(range);
    return range;
  }
}
