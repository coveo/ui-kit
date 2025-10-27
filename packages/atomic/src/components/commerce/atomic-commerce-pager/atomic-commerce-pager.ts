import {NumberValue, Schema} from '@coveo/bueno';
import {
  buildProductListing,
  buildSearch,
  type Pagination,
  type PaginationState,
  type ProductListing,
  type Search,
} from '@coveo/headless/commerce';
import {html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {keyed} from 'lit/directives/keyed.js';
import {when} from 'lit/directives/when.js';
import {createAppLoadedListener} from '@/src/components/common/interface/store';
import {
  renderPageButtons,
  renderPagerNextButton,
  renderPagerPageButton,
  renderPagerPreviousButton,
} from '@/src/components/common/pager/pager-buttons';
import {renderPagerNavigation} from '@/src/components/common/pager/pager-navigation';
import {getCurrentPagesRange} from '@/src/components/common/pager/pager-utils';
import {ValidatePropsController} from '@/src/components/common/validate-props-controller/validate-props-controller';
import {bindStateToController} from '@/src/decorators/bind-state';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import {
  AriaLiveRegionController,
  FocusTargetController,
} from '@/src/utils/accessibility-utils';
import {randomID} from '@/src/utils/utils';
import ArrowLeftIcon from '../../../images/arrow-left-rounded.svg';
import ArrowRightIcon from '../../../images/arrow-right-rounded.svg';
import type {CommerceBindings} from '../atomic-commerce-interface/atomic-commerce-interface';

/**
 * The `atomic-commerce-pager` component enables users to navigate through paginated products.
 *
 * @part buttons - The list of all buttons rendered by the component.
 * @part page-buttons - The list of all page buttons.
 * @part page-button - The individual page buttons.
 * @part active-page-button - The active page button.
 * @part previous-button - The "previous page" button.
 * @part next-button - The "next page" button.
 * @part previous-button-icon - The "previous page" button icon.
 * @part next-button-icon - The "next page" button icon.
 *
 * @event atomic/scrollToTop - Emitted when the user clicks the next or previous button, or a page button.
 */
@customElement('atomic-commerce-pager')
@bindings()
@withTailwindStyles
export class AtomicCommercePager
  extends LitElement
  implements InitializableComponent<CommerceBindings>
{
  @state() public bindings!: CommerceBindings;
  @state() public error!: Error;
  @state() private isAppLoaded = false;

  public pager!: Pagination;
  public listingOrSearch!: ProductListing | Search;

  @bindStateToController('pager')
  @state()
  public pagerState!: PaginationState;

  /**
   * The maximum number of page buttons to display.
   */
  @property({reflect: true, attribute: 'number-of-pages', type: Number})
  numberOfPages: number = 5;

  /**
   * The SVG icon to use to display the Previous button.
   *
   * - Use a value that starts with `http://`, `https://`, `./`, or `../`, to fetch and display an icon from a given location.
   * - Use a value that starts with `assets://`, to display an icon from the Atomic package.
   * - Use a stringified SVG to display it directly.
   */
  @property({reflect: true, attribute: 'previous-button-icon', type: String})
  previousButtonIcon: string = ArrowLeftIcon;

  /**
   * The SVG icon to use to display the Next button.
   *
   * - Use a value that starts with `http://`, `https://`, `./`, or `../`, to fetch and display an icon from a given location.
   * - Use a value that starts with `assets://`, to display an icon from the Atomic package.
   * - Use a stringified SVG to display it directly.
   */
  @property({reflect: true, attribute: 'next-button-icon', type: String})
  nextButtonIcon: string = ArrowRightIcon;

  protected ariaMessage = new AriaLiveRegionController(this, 'atomic-pager');

  private radioGroupName = randomID('atomic-commerce-pager-');

  private previousButton!: FocusTargetController;
  private nextButton!: FocusTargetController;

  constructor() {
    super();

    new ValidatePropsController(
      this,
      () => ({
        numberOfPages: this.numberOfPages,
      }),
      new Schema({
        numberOfPages: new NumberValue({min: 0}),
      })
    );
  }

  public initialize() {
    this.initFocusTargets();
    if (this.bindings.interfaceElement.type === 'product-listing') {
      this.listingOrSearch = buildProductListing(this.bindings.engine);
    } else {
      this.listingOrSearch = buildSearch(this.bindings.engine);
    }
    this.pager = this.listingOrSearch.pagination();
    createAppLoadedListener(this.bindings.store, (isAppLoaded) => {
      this.isAppLoaded = isAppLoaded;
    });
  }

  @bindingGuard()
  @errorGuard()
  render() {
    const pagesRange = getCurrentPagesRange(
      this.pagerState.page,
      this.numberOfPages,
      this.pagerState.totalPages - 1
    );

    return html`
      ${when(
        this.pagerState.totalPages > 1 && this.isAppLoaded,
        () => html`
          ${renderPagerNavigation({
            props: {
              i18n: this.bindings.i18n,
            },
          })(html`
            ${renderPagerPreviousButton({
              props: {
                icon: this.previousButtonIcon,
                disabled: this.pagerState.page === 0,
                i18n: this.bindings.i18n,
                onClick: async () => {
                  this.pager.previousPage();
                  await this.focusOnFirstResultAndScrollToTop();
                },
                ref: (el) => this.previousButton.setTarget(el as HTMLElement),
              },
            })}
            ${renderPageButtons({
              props: {
                i18n: this.bindings.i18n,
              },
            })(html`
              ${pagesRange.map((pageNumber, index) =>
                keyed(
                  `page-${pageNumber}-${index}`,
                  renderPagerPageButton({
                    props: {
                      isSelected: pageNumber === this.pagerState.page,
                      ariaLabel: this.bindings.i18n.t('page-number', {
                        pageNumber: pageNumber + 1,
                      }),
                      onChecked: async () => {
                        this.pager.selectPage(pageNumber);
                        await this.focusOnFirstResultAndScrollToTop();
                      },
                      page: pageNumber,
                      groupName: this.radioGroupName,
                      text: (pageNumber + 1).toLocaleString(
                        this.bindings.i18n.language
                      ),
                      onFocusCallback: this.handleFocus,
                    },
                  })
                )
              )}
            `)}
            ${renderPagerNextButton({
              props: {
                icon: this.nextButtonIcon,
                disabled:
                  this.pagerState.page + 1 >= this.pagerState.totalPages,
                i18n: this.bindings.i18n,
                onClick: async () => {
                  this.pager.nextPage();
                  await this.focusOnFirstResultAndScrollToTop();
                },
                ref: (el) => this.nextButton.setTarget(el as HTMLElement),
              },
            })}
          `)}
        `
      )}
    `;
  }

  private initFocusTargets() {
    if (!this.previousButton) {
      this.previousButton = new FocusTargetController(this, this.bindings);
    }
    if (!this.nextButton) {
      this.nextButton = new FocusTargetController(this, this.bindings);
    }
  }

  private handleFocus = async (
    elements: HTMLInputElement[],
    currentFocus: HTMLInputElement,
    newFocus: HTMLInputElement
  ) => {
    const currentIndex = elements.indexOf(currentFocus);
    const newIndex = elements.indexOf(newFocus);

    if (currentIndex === elements.length - 1 && newIndex === 0) {
      await this.nextButton.focus();
    } else if (currentIndex === 0 && newIndex === elements.length - 1) {
      await this.previousButton.focus();
    } else {
      newFocus.focus();
    }
  };

  private async focusOnFirstResultAndScrollToTop() {
    await this.bindings.store.state.resultList?.focusOnFirstResultAfterNextSearch();
    this.dispatchEvent(new CustomEvent('atomic/scrollToTop'));
    this.announcePageLoaded();
  }

  private announcePageLoaded() {
    this.ariaMessage.message = this.bindings.i18n.t('pager-page-loaded', {
      pageNumber: this.pagerState.page,
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-commerce-pager': AtomicCommercePager;
  }
}
