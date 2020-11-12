import {Component, h, State} from '@stencil/core';
import {
  Pager,
  PagerState,
  Unsubscribe,
  buildPager,
  Engine,
} from '@coveo/headless';
import {Initialization} from '../../utils/initialization-utils';

/**
 * @slot back-button - Content of the back button
 * @slot next-button - Content of the next button
 *
 * @part list - The list of buttons
 * @part back-button - The back button
 * @part next-button - The next button
 * @part page-button - The page button
 */
@Component({
  tag: 'atomic-pager',
  styleUrl: 'atomic-pager.scss',
  shadow: true,
})
export class AtomicPager {
  @State() state!: PagerState;

  private engine!: Engine;
  private pager!: Pager;
  private unsubscribe: Unsubscribe = () => {};

  @Initialization()
  public initialize() {
    this.pager = buildPager(this.engine);
    this.unsubscribe = this.pager.subscribe(() => this.updateState());
  }

  public disconnectedCallback() {
    this.unsubscribe();
  }

  private updateState() {
    this.state = this.pager.state;
  }

  private get backButton() {
    if (!this.state.hasPreviousPage) {
      return null;
    }

    const icon = '<';
    return (
      <li class="page-item">
        <button
          part="back-button"
          class="page-link"
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
    if (!this.state.hasNextPage) {
      return null;
    }

    const icon = '>';
    return (
      <li class="page-item">
        <button
          part="next-button"
          class="page-link"
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
      <li class={`page-item ${className}`}>
        <button
          part="page-button"
          class="page-link"
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

  render() {
    return (
      <nav aria-label="Pager">
        <ul class="pagination mb-0" part="list">
          {this.backButton}
          {this.pages}
          {this.nextButton}
        </ul>
      </nav>
    );
  }
}
