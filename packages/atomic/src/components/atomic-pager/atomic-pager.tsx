import {Component, h, Prop, State} from '@stencil/core';
import {Pager, PagerState, buildPager} from '@coveo/headless';
import {
  Bindings,
  BindStateToController,
  BindStateToI18n,
  InitializableComponent,
  InitializeBindings,
} from '../../utils/initialization-utils';
import ArrowRightIcon from 'coveo-styleguide/resources/icons/svg/arrow-right-rounded.svg';
import ArrowLeftIcon from 'coveo-styleguide/resources/icons/svg/arrow-left-rounded.svg';

/**
 * The Pager provides buttons that allow the end user to navigate through the different result pages.
 *
 * @part buttons - The list of buttons
 * @part previous-button - The previous button
 * @part next-button - The next button
 * @part page-button - The page button
 * @part active-page-button - The active page button
 */
@Component({
  tag: 'atomic-pager',
  styleUrl: 'atomic-pager.pcss',
  shadow: true,
})
export class AtomicPager implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  private pager!: Pager;

  @BindStateToController('pager')
  @State()
  private pagerState!: PagerState;
  @BindStateToI18n()
  @State()
  private strings = {
    pagination: () => this.bindings.i18n.t('pagination'),
    previous: () => this.bindings.i18n.t('previous'),
    next: () => this.bindings.i18n.t('next'),
    pageNumber: (page: number) => this.bindings.i18n.t('pageNumber', {page}),
  };
  @State() error!: Error;

  /**
   * Specifies how many page buttons to display in the pager.
   */
  @Prop() numberOfPages = 5;
  /**
   * Specifies whether the **Previous** and **Next** buttons should appear at each end of the pager when appropriate.
   */
  @Prop() enableNavigationButtons = true;

  public initialize() {
    this.pager = buildPager(this.bindings.engine, {
      options: {numberOfPages: this.numberOfPages},
    });
  }

  private buildButton(options: {
    part: string;
    disabled: boolean;
    ariaLabel: string;
    callback: () => void;
    icon: string;
  }) {
    return (
      <li>
        <button
          part={options.part}
          class={`text-primary ${
            options.disabled
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:text-primary-variant'
          }`}
          disabled={options.disabled}
          aria-label={options.ariaLabel}
          onClick={options.callback}
        >
          <span class="fill-current" innerHTML={options.icon}></span>
        </button>
      </li>
    );
  }

  private get previousButton() {
    return this.buildButton({
      ariaLabel: this.strings.previous(),
      callback: () => {
        this.pager.previousPage();
      },
      disabled: !this.pagerState.hasPreviousPage,
      icon: ArrowLeftIcon,
      part: 'previous-button',
    });
  }

  private get nextButton() {
    return this.buildButton({
      ariaLabel: this.strings.next(),
      callback: () => {
        this.pager.nextPage();
      },
      disabled: !this.pagerState.hasNextPage,
      icon: ArrowRightIcon,
      part: 'next-button',
    });
  }

  private get pages() {
    const pages = this.pager.state.currentPages;
    return pages.map((page) => this.buildPage(page));
  }

  private buildPage(page: number) {
    const isSelected = this.pager.isCurrentPage(page);
    const classes = isSelected
      ? 'text-on-primary bg-primary hover:bg-primary-variant'
      : 'text-on-background';

    return (
      <li>
        <button
          class={`hover:underline ${classes}`}
          aria-current={isSelected ? 'page' : null}
          part={`page-button ${isSelected && 'active-page-button'}`}
          aria-label={this.strings.pageNumber(page)}
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
      <nav aria-label={this.strings.pagination()} class="items-center ">
        <ul part="buttons" class="flex justify-between space-x-2">
          {this.enableNavigationButtons && this.previousButton}
          {this.pages}
          {this.enableNavigationButtons && this.nextButton}
        </ul>
      </nav>
    );
  }
}
