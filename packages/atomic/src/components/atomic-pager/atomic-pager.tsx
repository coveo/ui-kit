import {Component, h, State} from '@stencil/core';
import {Pager, PagerState, buildPager} from '@coveo/headless';
import {
  Initialization,
  Bindings,
  AtomicComponentInterface,
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
  styleUrl: 'atomic-pager.css',
  shadow: true,
})
export class AtomicPager implements AtomicComponentInterface {
  @State() controllerState!: PagerState;

  public bindings!: Bindings;
  public controller!: Pager;

  @Initialization()
  public initialize() {
    this.controller = buildPager(this.bindings.engine);
  }

  private get backButton() {
    if (!this.controllerState.hasPreviousPage) {
      return null;
    }

    const icon = '<';
    return (
      <li>
        <button
          part="back-button"
          aria-label="Previous page"
          onClick={() => {
            this.controller.previousPage();
          }}
        >
          <slot name="back-button">{icon}</slot>
        </button>
      </li>
    );
  }

  private get nextButton() {
    if (!this.controllerState.hasNextPage) {
      return null;
    }

    const icon = '>';
    return (
      <li>
        <button
          part="next-button"
          aria-label="Next page"
          onClick={() => {
            this.controller.nextPage();
          }}
        >
          <slot name="next-button">{icon}</slot>
        </button>
      </li>
    );
  }

  private get pages() {
    const pages = this.controller.state.currentPages;
    return pages.map((page) => this.buildPage(page));
  }

  private buildPage(page: number) {
    const isSelected = this.controller.isCurrentPage(page);
    const className = isSelected ? 'active' : '';

    return (
      <li class={className}>
        <button
          part={`page-button ${isSelected && 'active-page-button'}`}
          aria-label={`Page ${page}`}
          onClick={() => {
            this.controller.selectPage(page);
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
        <ul part="list">
          {this.backButton}
          {this.pages}
          {this.nextButton}
        </ul>
      </nav>
    );
  }
}
