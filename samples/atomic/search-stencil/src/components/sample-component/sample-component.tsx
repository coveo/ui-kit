import {type Bindings, initializeBindings} from '@coveo/atomic';
import {
  buildPager,
  buildSearchStatus,
  type Pager,
  type PagerState,
  type SearchStatusState,
  type Unsubscribe,
} from '@coveo/headless';
// biome-ignore lint/correctness/noUnusedImports: <>
import {Component, Element, forceUpdate, h, State} from '@stencil/core';

@Component({
  tag: 'sample-component',
  styleUrl: 'sample-component.css',
  shadow: true,
})
export class SampleComponent {
  private bindings?: Bindings;
  private error?: Error;
  private pagerController!: Pager;

  private pagerUnsubscribe: Unsubscribe = () => {};
  private statusUnsubscribe: Unsubscribe = () => {};
  private i18nUnsubscribe = () => {};

  @Element() private host!: Element;

  @State() private pagerState!: PagerState;
  @State() private statusState!: SearchStatusState;

  public async connectedCallback() {
    try {
      this.bindings = await initializeBindings(this.host);
      const statusController = buildSearchStatus(this.bindings.engine);
      this.pagerController = buildPager(this.bindings.engine);
      this.statusUnsubscribe = statusController.subscribe(() => {
        this.statusState = statusController.state;
      });
      this.pagerUnsubscribe = this.pagerController.subscribe(() => {
        this.pagerState = this.pagerController.state;
      });
      const updateLanguage = () => forceUpdate(this);
      this.bindings!.i18n.on('languageChanged', updateLanguage);
      this.i18nUnsubscribe = () =>
        this.bindings!.i18n.off('languageChanged', updateLanguage);
    } catch (error) {
      console.error(error);
      this.error = error as Error;
    }
  }

  public disconnectedCallback() {
    this.pagerUnsubscribe();
    this.statusUnsubscribe();
    this.i18nUnsubscribe();
  }

  private get pages() {
    const pages = this.pagerState!.currentPages;
    return pages.map((page) => this.buildPage(page));
  }

  private buildPage(page: number) {
    const isSelected = this.pagerController.isCurrentPage(page);
    return (
      <button
        type="button"
        onClick={() => {
          this.pagerController.selectPage(page);
        }}
      >
        {isSelected ? '✓ ' : ''}
        {page.toLocaleString(this.bindings!.i18n.language)}
      </button>
    );
  }

  private get previous() {
    return (
      <button
        type="button"
        onClick={() => {
          this.pagerController.previousPage();
        }}
      >
        <atomic-text value="previous"></atomic-text>
      </button>
    );
  }

  private get next() {
    return (
      <button
        type="button"
        onClick={() => {
          this.pagerController.nextPage();
        }}
      >
        <atomic-text value="next"></atomic-text>
      </button>
    );
  }

  public render() {
    if (this.error) {
      return (
        <p>
          Error when initializing the component, please view the console for
          more information.
        </p>
      );
    }

    if (!this.bindings || !this.statusState.hasResults) {
      return;
    }

    return (
      <nav>
        {this.pagerState.hasPreviousPage && this.previous}
        {this.pages}
        {this.pagerState.hasNextPage && this.next}
      </nav>
    );
  }
}
