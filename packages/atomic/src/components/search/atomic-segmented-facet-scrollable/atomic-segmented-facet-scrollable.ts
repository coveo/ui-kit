import {
  buildSearchStatus,
  type SearchStatus,
  type SearchStatusState,
} from '@coveo/headless';
import {type CSSResultGroup, css, html, LitElement, nothing} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {createRef, type Ref, ref} from 'lit/directives/ref.js';
import {renderButton} from '@/src/components/common/button';
import type {Bindings} from '@/src/components/search/atomic-search-interface/interfaces';
import {bindStateToController} from '@/src/decorators/bind-state';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import ArrowLeftIcon from '@/src/images/arrow-left-rounded.svg';
import ArrowRightIcon from '@/src/images/arrow-right-rounded.svg';
import '@/src/components/common/atomic-icon/atomic-icon';

type ArrowDirection = 'right' | 'left';

/**
 * The `atomic-segmented-facet-scrollable` component wraps around one or several `atomic-segmented-facet` to provide horizontal scrolling capabilities.
 *
 * @slot (default) - One or multiple atomic-segmented-facet components
 *
 * @part scrollable-container - The wrapper for the entire component including the horizontal-scroll container and the arrow buttons.
 * @part horizontal-scroll - The scrollable container for the segmented facets.
 * @part left-arrow-wrapper - The wrapper for the arrow button & fade on the left.
 * @part right-arrow-wrapper - The wrapper for the arrow button & fade on the right.
 * @part left-arrow-button - The arrow button used to scroll on the left.
 * @part right-arrow-button - The arrow button used to scroll on the right.
 * @part left-arrow-icon - The arrow icon on the left.
 * @part right-arrow-icon - The arrow icon on the right.
 * @part left-fade - The white to transparent gradient on the left.
 * @part right-fade - The white to transparent gradient on the right.
 */
@customElement('atomic-segmented-facet-scrollable')
@bindings()
@withTailwindStyles
export class AtomicSegmentedFacetScrollable
  extends LitElement
  implements InitializableComponent<Bindings>
{
  static styles: CSSResultGroup = css`
    .wrapper-segmented {
      scrollbar-width: none;
      -ms-overflow-style: none;
    }
    .wrapper-segmented::-webkit-scrollbar {
      display: none;
    }
  `;

  @state() public bindings!: Bindings;
  @state() public error!: Error;

  public searchStatus!: SearchStatus;
  @bindStateToController('searchStatus')
  @state()
  public searchStatusState!: SearchStatusState;

  @state() private hideLeftArrow = true;
  @state() private hideRightArrow = true;

  private horizontalScrollRef: Ref<HTMLDivElement> = createRef();
  private arrowRef: Ref<HTMLButtonElement> = createRef();
  private observer?: ResizeObserver;

  public initialize() {
    this.searchStatus = buildSearchStatus(this.bindings.engine);
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('wheel', this.handleScroll);
    this.addEventListener('touchmove', this.handleScroll);
    this.addEventListener('keydown', this.handleScroll);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.observer?.disconnect();
    this.removeEventListener('wheel', this.handleScroll);
    this.removeEventListener('touchmove', this.handleScroll);
    this.removeEventListener('keydown', this.handleScroll);
  }

  firstUpdated() {
    this.observer = new ResizeObserver(() => {
      this.handleScroll();
    });

    Array.from(this.children).forEach((el) => this.observer!.observe(el));
    if (this.horizontalScrollRef.value) {
      this.observer.observe(this.horizontalScrollRef.value);
    }
  }

  @errorGuard()
  @bindingGuard()
  render() {
    if (this.searchStatusState.hasError) {
      return html`${nothing}`;
    }

    return html`
      <div part="scrollable-container" class="relative flex">
        ${this.renderArrow('left')}
        <div
          part="horizontal-scroll"
          class="wrapper-segmented flex flex-row overflow-x-scroll scroll-smooth"
          ${ref(this.horizontalScrollRef)}
        >
          <slot></slot>
        </div>
        ${this.renderArrow('right')}
      </div>
    `;
  }

  private handleScroll = () => {
    if (!this.horizontalScrollRef.value) {
      return;
    }
    const container = this.horizontalScrollRef.value;
    const isScrollable = container.clientWidth < container.scrollWidth;

    const isLeftEdge = Math.floor(container.scrollLeft) <= 0;
    const isRightEdge =
      Math.ceil(container.scrollLeft) >=
      container.scrollWidth - container.clientWidth;

    this.hideLeftArrow = !isScrollable || isLeftEdge;
    this.hideRightArrow = !isScrollable || isRightEdge;
  };

  private slideHorizontally(direction: ArrowDirection) {
    const container = this.horizontalScrollRef.value!;
    const arrowsWidth = this.arrowRef.value!.clientWidth * 2;

    const pixelsToScroll = (container.clientWidth - arrowsWidth) * 0.7;

    const isLeftEdge = Math.floor(container.scrollLeft - pixelsToScroll) <= 0;
    const isRightEdge =
      Math.ceil(container.scrollLeft + pixelsToScroll) >=
      container.scrollWidth - container.clientWidth;

    this.hideLeftArrow = false;
    this.hideRightArrow = false;

    if (direction === 'left') {
      container.scrollLeft -= pixelsToScroll;
      this.hideLeftArrow = isLeftEdge;
      return;
    }

    container.scrollLeft += pixelsToScroll;
    this.hideRightArrow = isRightEdge;
  }

  private renderArrow(direction: ArrowDirection) {
    const hide =
      (direction === 'left' && this.hideLeftArrow) ||
      (direction === 'right' && this.hideRightArrow);
    const hiddenClass = hide ? 'invisible opacity-0' : '';
    const transitionClass =
      'transition-opacity transition-[visibility] ease-in-out duration-300';

    return html`
      <div
        part="${direction}-arrow-wrapper"
        class="${hiddenClass} ${transitionClass}"
      >
        ${renderButton({
          props: {
            style: 'square-neutral',
            part: `${direction}-arrow-button`,
            class: `absolute top-0 bottom-0 z-1 flex h-10 w-10 shrink-0 basis-8 items-center justify-center rounded ${
              direction === 'left' ? 'left-0' : 'right-0'
            }`,
            ariaHidden: 'true',
            tabIndex: -1,
            onClick: () => this.slideHorizontally(direction),
            ref: this.arrowRef,
          },
        })(html`
          <atomic-icon
            part="${direction}-arrow-icon"
            class="w-3.5"
            .icon=${direction === 'left' ? ArrowLeftIcon : ArrowRightIcon}
          ></atomic-icon>
        `)}
        <div
          part="${direction}-fade"
          class="from-background/60 pointer-events-none absolute top-0 z-0 h-10 w-20 ${
            direction === 'left'
              ? 'left-0 bg-linear-to-r'
              : 'right-0 bg-linear-to-l'
          }"
        ></div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-segmented-facet-scrollable': AtomicSegmentedFacetScrollable;
  }
}
