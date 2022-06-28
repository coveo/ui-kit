import {Component, h, Listen, State} from '@stencil/core';
import ArrowRightIcon from 'coveo-styleguide/resources/icons/svg/arrow-right-rounded.svg';
import ArrowLeftIcon from 'coveo-styleguide/resources/icons/svg/arrow-left-rounded.svg';
import {Button} from '../../common/button';

type ArrowDirection = 'right' | 'left';

@Component({
  tag: 'atomic-segmented-facet-scrollable',
  styleUrl: 'atomic-segmented-facet-scrollable.pcss',
  shadow: true,
})
export class AtomicSegmentedFacetScrollable {
  private horizontalScroll?: HTMLDivElement;
  @State() private hideLeftArrow = false;
  @State() private hideRightArrow = false;

  @Listen('mousewheel')
  handleScroll() {
    const isOverflowing =
      this.horizontalScroll &&
      this.horizontalScroll?.clientWidth < this.horizontalScroll?.scrollWidth;
    const isLeftEdge = this.horizontalScroll?.scrollLeft === 0;
    const isRightEdge =
      this.horizontalScroll &&
      this.horizontalScroll.scrollLeft >=
        this.horizontalScroll.scrollWidth - this.horizontalScroll.clientWidth;

    if (!isOverflowing) {
      this.hideLeftArrow = true;
      this.hideRightArrow = true;
    } else if (isLeftEdge) {
      this.hideLeftArrow = true;
    } else if (isRightEdge) {
      this.hideRightArrow = true;
    } else {
      this.hideLeftArrow = false;
      this.hideRightArrow = false;
    }
  }

  private slideHorizontally(direction: ArrowDirection) {
    const container = this.horizontalScroll;
    const pixelsToScroll = container ? container.clientWidth * 0.75 : 700;

    if (container === null || !container) {
      return;
    }
    if (direction === 'left') {
      container.scrollLeft -= pixelsToScroll;
    } else {
      container.scrollLeft += pixelsToScroll;
    }
    this.handleScroll();
  }

  private renderDirectionClass(direction: ArrowDirection) {
    if (direction === 'left') {
      return 'left-0 ' + (this.hideLeftArrow ? 'hidden' : '');
    } else {
      return 'right-0 ' + (this.hideRightArrow ? 'hidden' : '');
    }
  }

  private renderFadeClass(direction: ArrowDirection) {
    if (direction === 'left') {
      return 'bg-gradient-to-r left-0 ' + (this.hideLeftArrow ? 'hidden' : '');
    } else {
      return (
        'bg-gradient-to-l right-0 ' + (this.hideRightArrow ? 'hidden' : '')
      );
    }
  }

  private renderArrow(direction: ArrowDirection) {
    const isLeft: boolean = direction === 'left';
    return [
      <Button
        part="arrow"
        style="square-neutral"
        class={`flex shrink-0 basis-8 justify-center items-center rounded absolute z-10 w-10 top-0 bottom-0 ${this.renderDirectionClass(
          direction
        )}`}
        ariaHidden="true"
        onClick={() => this.slideHorizontally(direction)}
      >
        <atomic-icon
          class="w-3.5"
          icon={isLeft ? ArrowLeftIcon : ArrowRightIcon}
        ></atomic-icon>
      </Button>,
      <div
        part="fade"
        class={`w-16 h-10 absolute top-0  z-[5] pointer-events-none from-background-80 ${this.renderFadeClass(
          direction
        )}`}
      ></div>,
    ];
  }

  render() {
    return (
      <div part="scrollableContainer" class="flex h-10 relative">
        {this.renderArrow('left')}
        <div
          part="horizontalScroll"
          class="wrapper-segmented flex flex-row ml-10 mr-10 overflow-x-scroll scroll-smooth"
          ref={(el) => (this.horizontalScroll = el as HTMLDivElement)}
        >
          <slot></slot>
        </div>
        {this.renderArrow('right')}
      </div>
    );
  }
}
