import {
  Pagination,
  PaginationState,
  ProductListing,
  Search,
  buildProductListing,
  buildSearch,
} from '@coveo/headless/commerce';
import {Component, Event, EventEmitter, h, Prop, State} from '@stencil/core';
import ArrowLeftIcon from '../../../images/arrow-left-rounded.svg';
import ArrowRightIcon from '../../../images/arrow-right-rounded.svg';
import {FocusTargetController} from '../../../utils/accessibility-utils';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {randomID} from '../../../utils/utils';
import {
  PagerNextButton,
  PagerPageButton,
  PagerPageButtons,
  PagerPreviousButton,
} from '../../common/pager/pager-buttons';
import {PagerGuard} from '../../common/pager/pager-guard';
import {PagerNavigation} from '../../common/pager/pager-navigation';
import {CommerceBindings} from '../atomic-commerce-interface/atomic-commerce-interface';
import {getCurrentPagesRange} from './commerce-pager-utils';

/**
 * The `atomic-pager` provides buttons that allow the end user to navigate through the different product pages.
 *
 * @part buttons - The list of the next/previous buttons and page-buttons.
 * @part page-buttons - The list of page buttons.
 * @part page-button - The page button.
 * @part active-page-button - The active page button.
 * @part previous-button - The previous button.
 * @part next-button - The next button.
 * @part previous-button-icon - Icon of the previous button.
 * @part next-button-icon - Icon of the next button.
 *
 * @internal
 */
@Component({
  tag: 'atomic-commerce-pager',
  styleUrl: 'atomic-commerce-pager.pcss',
  shadow: true,
})
export class AtomicCommercePager
  implements InitializableComponent<CommerceBindings>
{
  @InitializeBindings() public bindings!: CommerceBindings;
  public pager!: Pagination;
  public listingOrSearch!: ProductListing | Search;

  @BindStateToController('pager')
  @State()
  public pagerState!: PaginationState;

  @State() error!: Error;

  @Event({
    eventName: 'atomic/scrollToTop',
  })
  private scrollToTopEvent!: EventEmitter;

  /**
   * Specifies how many page buttons to display in the pager.
   */
  @Prop({reflect: true}) numberOfPages = 5;

  /**
   * The SVG icon to use to display the Previous button.
   *
   * - Use a value that starts with `http://`, `https://`, `./`, or `../`, to fetch and display an icon from a given location.
   * - Use a value that starts with `assets://`, to display an icon from the Atomic package.
   * - Use a stringified SVG to display it directly.
   */
  @Prop({reflect: true}) previousButtonIcon = ArrowLeftIcon;

  /**
   * The SVG icon to use to display the Next button.
   *
   * - Use a value that starts with `http://`, `https://`, `./`, or `../`, to fetch and display an icon from a given location.
   * - Use a value that starts with `assets://`, to display an icon from the Atomic package.
   * - Use a stringified SVG to display it directly.
   */
  @Prop({reflect: true}) nextButtonIcon = ArrowRightIcon;

  private activePage?: FocusTargetController;
  private radioGroupName = randomID('atomic-commerce-pager-');

  public initialize() {
    if (this.bindings.interfaceElement.type === 'product-listing') {
      this.listingOrSearch = buildProductListing(this.bindings.engine);
    } else {
      this.listingOrSearch = buildSearch(this.bindings.engine);
    }
    this.pager = this.listingOrSearch.pagination();
  }

  public render() {
    const pagesRange = getCurrentPagesRange(
      this.pagerState.page,
      this.numberOfPages,
      this.pagerState.totalPages - 1
    );

    return (
      <PagerGuard
        hasError={false}
        hasResults={this.pagerState.totalPages > 1}
        isAppLoaded={this.bindings.store.isAppLoaded()}
      >
        <PagerNavigation label={this.bindings.i18n.t('pagination')}>
          <PagerPreviousButton
            icon={this.previousButtonIcon}
            disabled={this.pagerState.page === 0}
            ariaLabel={this.bindings.i18n.t('previous')}
            onClick={() => {
              this.pager.previousPage();
              this.focusOnFirstResultAndScrollToTop();
            }}
          />
          <PagerPageButtons>
            {pagesRange.map((pageNumber) => {
              return (
                <PagerPageButton
                  isSelected={pageNumber === this.pagerState.page}
                  ariaLabel={this.bindings.i18n.t('page-number', {
                    pageNumber,
                  })}
                  onChecked={() => {
                    this.pager.selectPage(pageNumber);
                    this.focusOnFirstResultAndScrollToTop();
                  }}
                  page={pageNumber}
                  groupName={this.radioGroupName}
                  ref={(el) => {
                    const isSelected = pageNumber === this.pagerState.page;
                    if (isSelected && el) {
                      this.focusTarget.setTarget(el);
                    }
                  }}
                  text={(pageNumber + 1).toLocaleString(
                    this.bindings.i18n.language
                  )}
                />
              );
            })}
          </PagerPageButtons>
          <PagerNextButton
            icon={this.nextButtonIcon}
            disabled={this.pagerState.page >= this.pagerState.totalPages}
            ariaLabel={this.bindings.i18n.t('next')}
            onClick={() => {
              this.pager.nextPage();
              this.focusOnFirstResultAndScrollToTop();
            }}
          />
        </PagerNavigation>
      </PagerGuard>
    );
  }

  private async focusOnFirstResultAndScrollToTop() {
    await this.bindings.store.state.resultList?.focusOnFirstResultAfterNextSearch();
    this.scrollToTopEvent.emit();
  }

  private get focusTarget() {
    if (!this.activePage) {
      this.activePage = new FocusTargetController(this);
    }
    return this.activePage;
  }
}
