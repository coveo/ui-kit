import {Component, h, State} from '@stencil/core';
import {Pager, PagerState, buildPager} from '@coveo/headless';
import {
  Bindings,
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../utils/initialization-utils';

/**
 * @slot back-button - Content of the back button
 * @slot next-button - Content of the next button
 *
 * @part list - The list of buttons
 * @part back-button - The back button
 * @part next-button - The next button
 * @part page-button - The page button
 * @part active-page-button - The active page button
 */
@Component({
  tag: 'atomic-pager',
  styleUrl: 'atomic-pager.pcss',
  shadow: false,
})
export class AtomicPager implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  private pager!: Pager;

  @BindStateToController('pager')
  @State()
  private pagerState!: PagerState;
  @State() public error!: Error;

  public initialize() {
    this.pager = buildPager(this.bindings.engine);
  }

  private get backButton() {
    if (!this.pagerState.hasPreviousPage) {
      return null;
    }

    const icon = '<';
    return (
      <li>
        <button
          part="back-button"
          aria-label="Previous page"
          onClick={() => {
            this.pager.previousPage();
          }}
        >
          <slot name="back-button">{icon}</slot>
        </button>
      </li>
    );
  }

  private get nextButton() {
    if (!this.pagerState.hasNextPage) {
      return null;
    }

    const icon = '>';
    return (
      <li>
        <button
          part="next-button"
          aria-label="Next page"
          onClick={() => {
            this.pager.nextPage();
          }}
        >
          <slot name="next-button">{icon}</slot>
        </button>
      </li>
    );
  }

  private get pages() {
    const pages = this.pager.state.currentPages;
    return pages.map((page) => this.buildPage(page));
  }

  private buildPage(page: number) {
    const isSelected = this.pager.isCurrentPage(page);
    const className = isSelected ? 'active' : '';

    return (
      <li class={className}>
        <button
          part={`page-button ${isSelected && 'active-page-button'}`}
          aria-label={`Page ${page}`}
          onClick={() => {
            this.pager.selectPage(page);
          }}
        >
          {page}
        </button>
      </li>
    );
  }

  public render() {
    return (
      <nav aria-label="Pager">
        <ul part="list">
          {this.backButton}
          {this.pages}
          {this.nextButton}
        </ul>
      </nav>
    );
  }
}
