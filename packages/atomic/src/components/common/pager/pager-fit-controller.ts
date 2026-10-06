import type {LitElement, ReactiveController} from 'lit';

/**
 * A reactive controller that keeps a pager on a single row. While the pager buttons wrap, the page
 * button farthest from the current page is dropped, keeping at least one. All the page buttons are
 * tried again whenever the pager's parent or the viewport is resized.
 */
export class PagerFitController implements ReactiveController {
  private maxPages = Number.POSITIVE_INFINITY;
  private resizeObserver?: ResizeObserver;

  constructor(private host: LitElement) {
    host.addController(this);
  }

  hostConnected() {
    // Deferred to the next frame to avoid ResizeObserver loop errors.
    this.resizeObserver = new ResizeObserver(() => requestAnimationFrame(() => this.reset()));
    this.resizeObserver.observe(document.documentElement);
    if (this.host.parentElement) {
      this.resizeObserver.observe(this.host.parentElement);
    }
  }

  hostDisconnected() {
    this.resizeObserver?.disconnect();
  }

  hostUpdated() {
    const root = this.host.shadowRoot;
    const previousButton = root?.querySelector<HTMLElement>('[part="previous-button"]');
    const nextButton = root?.querySelector<HTMLElement>('[part="next-button"]');
    const pageButtonCount = root?.querySelectorAll('[part~="page-button"]').length ?? 0;
    const isWrapping =
      !!previousButton && !!nextButton && nextButton.offsetTop > previousButton.offsetTop;

    if (isWrapping && pageButtonCount > 1) {
      this.maxPages = pageButtonCount - 1;
      // Deferred to a microtask to avoid Lit's change-in-update warning; it still renders before the next paint.
      queueMicrotask(() => this.host.requestUpdate());
    }
  }

  /**
   * Returns how many page buttons the pager should display.
   * @param numberOfPages The maximum number of page buttons configured on the pager.
   */
  public getNumberOfPagesToDisplay(numberOfPages: number) {
    return Math.min(numberOfPages, this.maxPages);
  }

  private reset() {
    this.maxPages = Number.POSITIVE_INFINITY;
    this.host.requestUpdate();
  }
}
