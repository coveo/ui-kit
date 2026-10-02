import type {LitElement, ReactiveController} from 'lit';

/**
 * A reactive controller that keeps a pager on a single row by reducing the number of page
 * buttons it displays when they don't fit in the available width.
 *
 * Every update starts from the full number of page buttons. If the row wraps, the page buttons
 * farthest from the current page are dropped until it fits, keeping at least one page button.
 * The pager is fitted again whenever its parent or the viewport is resized.
 */
export class PagerFitController implements ReactiveController {
  private maxFittingPages = Number.POSITIVE_INFINITY;
  private isFitUpdate = false;
  private observedWidths = new WeakMap<Element, number>();
  private resizeObserver?: ResizeObserver;
  private animationFrame?: number;

  constructor(private host: LitElement) {
    host.addController(this);
  }

  hostConnected() {
    if (typeof ResizeObserver === 'undefined') {
      return;
    }

    this.resizeObserver = new ResizeObserver((entries) => this.onResize(entries));
    if (this.host.parentElement) {
      this.resizeObserver.observe(this.host.parentElement);
    }
    this.resizeObserver.observe(document.documentElement);
  }

  hostDisconnected() {
    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;
    this.observedWidths = new WeakMap();
    if (this.animationFrame !== undefined) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = undefined;
    }
  }

  hostUpdate() {
    if (this.isFitUpdate) {
      this.isFitUpdate = false;
      return;
    }
    this.maxFittingPages = Number.POSITIVE_INFINITY;
  }

  hostUpdated() {
    this.fitPageButtons();
  }

  /**
   * Returns how many page buttons the pager should display.
   * @param numberOfPages The maximum number of page buttons configured on the pager.
   */
  public getNumberOfPagesToDisplay(numberOfPages: number) {
    return Math.min(numberOfPages, this.maxFittingPages);
  }

  private onResize(entries: ResizeObserverEntry[]) {
    let hasWidthChanged = false;
    for (const {target, contentRect} of entries) {
      if (this.observedWidths.get(target) !== contentRect.width) {
        this.observedWidths.set(target, contentRect.width);
        hasWidthChanged = true;
      }
    }
    if (!hasWidthChanged || this.animationFrame !== undefined) {
      return;
    }

    this.animationFrame = requestAnimationFrame(() => {
      this.animationFrame = undefined;
      this.host.requestUpdate();
    });
  }

  private fitPageButtons() {
    const row = this.host.shadowRoot?.querySelector<HTMLElement>('[part="buttons"]');
    if (!row) {
      return;
    }

    const buttons = Array.from(row.querySelectorAll('button'));
    const pageButtons = Array.from(row.querySelectorAll('[part~="page-button"]'));
    if (pageButtons.length <= 1 || !isWrapping(buttons)) {
      return;
    }

    const gap = Number.parseFloat(getComputedStyle(row).columnGap) || 0;
    const requiredWidth =
      buttons.reduce((total, button) => total + getWidth(button), 0) + gap * (buttons.length - 1);
    const excessWidth = requiredWidth - getWidth(row);
    const pageButtonSlotWidth = Math.max(...pageButtons.map(getWidth)) + gap;
    const pagesToRemove = Math.max(1, Math.ceil(excessWidth / pageButtonSlotWidth));

    this.maxFittingPages = Math.max(1, pageButtons.length - pagesToRemove);
    this.isFitUpdate = true;
    // Requesting the update outside of `updated` avoids Lit's change-in-update warning, and still renders before the next paint.
    queueMicrotask(() => this.host.requestUpdate());
  }
}

function isWrapping(buttons: Element[]) {
  const first = buttons.at(0);
  const last = buttons.at(-1);
  if (!first || !last) {
    return false;
  }
  return last.getBoundingClientRect().top > first.getBoundingClientRect().top;
}

function getWidth(element: Element) {
  return element.getBoundingClientRect().width;
}
