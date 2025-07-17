import {type Bindings, initializeBindings} from '@coveo/atomic';
import {Component, Element, h, State, forceUpdate} from '@stencil/core';
import {
  type PagerState,
  type Pager,
  type SearchStatusState,
  buildSearchStatus,
  buildPager,
  type Unsubscribe,
} from '@coveo/headless';
import {waitForAtomic} from '../../utils/atomic';

/**
 * Sample custom Atomic component, initializing itself against a parent search interface in order to retrieve the bindings.
 *
 * This component showcases a custom-made pagination component, for educational purposes.
 *
 * In a real life scenario, we recommend using either [atomic-pager](https://docs.coveo.com/en/atomic/latest/reference/components/atomic-pager/) or [atomic-load-more-results](https://docs.coveo.com/en/atomic/latest/reference/components/atomic-load-more-results/) instead.
 */
@Component({
  tag: 'sample-component',
  styleUrl: 'sample-component.css',
  shadow: true,
})
export class SampleComponent {
  // The Atomic bindings to be resolved on the parent atomic-search-interface.
  // Used to access the Headless engine in order to create controllers, dispatch actions, access state, etc.
  private bindings?: Bindings;

  // We recommend recording possible errors thrown during the configuration.
  private error?: Error;

  // Headless controller that contains the necessary methods.
  private pagerController!: Pager;

  // When disconnecting components from the page, we recommend removing
  // state change listeners as well by calling the unsubscribe methods.
  private pagerUnsubscribe: Unsubscribe = () => {};
  private statusUnsubscribe: Unsubscribe = () => {};
  private i18nUnsubscribe = () => {};

  @Element() private host!: Element;

  // Headless controller state property, using the `@State()` decorator.
  // Headless will automatically update these objects when the state related
  // to the controller has changed.
  @State() private pagerState!: PagerState;
  @State() private statusState!: SearchStatusState;

  // We recommend initializing the bindings and the Headless controllers
  // using the `connectedCallback` lifecycle method with async/await.
  // Using `componentWillLoad` will hang the parent atomic-search-interface initialization.
  public async connectedCallback() {
    try {
      // Wait for the Atomic to load and bindings to be resolved.
      await waitForAtomic();
      this.bindings = await initializeBindings(this.host);

      // Initialize controllers.
      const statusController = buildSearchStatus(this.bindings.engine);
      this.pagerController = buildPager(this.bindings.engine);

      // Subscribe to controller state changes.
      this.statusUnsubscribe = statusController.subscribe(
        () => (this.statusState = statusController.state)
      );
      this.pagerUnsubscribe = this.pagerController.subscribe(
        () => (this.pagerState = this.pagerController.state)
      );

      // (Optional) To use if component needs to rerender when the Atomic i18n language changes.
      // If your component does not use any strings or does not support multiple languages,
      // you can ignore everything related to i18n.
      const updateLanguage = () => forceUpdate(this);
      this.bindings!.i18n.on('languageChanged', updateLanguage);
      this.i18nUnsubscribe = () =>
        this.bindings!.i18n.off('languageChanged', updateLanguage);
    } catch (error) {
      console.error(error);
      this.error = error as Error;
    }
  }

  // The `disconnectedCallback` lifecycle method should be used to unsubcribe controllers and
  // possibly the i18n language change listener.
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
