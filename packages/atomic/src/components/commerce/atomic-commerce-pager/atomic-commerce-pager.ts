import {NumberValue, Schema} from '@coveo/bueno';
import {
  buildProductListing,
  buildSearch,
  Pagination,
  PaginationState,
  ProductListing,
  Search,
} from '@coveo/headless/commerce';
import {html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {bindStateToController} from '@/src/decorators/bind-state';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import {randomID} from '@/src/utils/utils';
import ArrowLeftIcon from '../../../images/arrow-left-rounded.svg';
import ArrowRightIcon from '../../../images/arrow-right-rounded.svg';
import {createAppLoadedListener} from '../../common/interface/store';
import {
  renderPageButtons,
  renderPagerNextButton,
  renderPagerPageButton,
  renderPagerPreviousButton,
} from '../../common/pager/pager-buttons';
import {renderPagerGuard} from '../../common/pager/pager-guard';
import {renderPagerNavigation} from '../../common/pager/pager-navigation';
import {CommerceBindings} from '../atomic-commerce-interface/atomic-commerce-interface';
import {getCurrentPagesRange} from './commerce-pager-utils';

/**
 * The `atomic-commerce-pager` component enables users to navigate through paginated product results.
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
 * @alpha
 */
@customElement('atomic-commerce-pager')
@bindings()
@withTailwindStyles
export class AtomicCommercePager
  extends LitElement
  implements InitializableComponent<CommerceBindings>
{
  @state()
  bindings!: CommerceBindings;
  @state() error!: Error;
  @state() private isAppLoaded = false;

  @bindStateToController('pager')
  @state()
  public pagerState!: PaginationState;

  /**
   * The maximum number of page buttons to display.
   */
  @property({reflect: true, attribute: 'number-of-pages', type: Number})
  numberOfPages = 5;

  /**
   * The SVG icon to use to display the Previous button.
   *
   * - Use a value that starts with `http://`, `https://`, `./`, or `../`, to fetch and display an icon from a given location.
   * - Use a value that starts with `assets://`, to display an icon from the Atomic package.
   * - Use a stringified SVG to display it directly.
   */
  @property({reflect: true, attribute: 'previous-button-icon', type: String})
  previousButtonIcon = ArrowLeftIcon;

  /**
   * The SVG icon to use to display the Next button.
   *
   * - Use a value that starts with `http://`, `https://`, `./`, or `../`, to fetch and display an icon from a given location.
   * - Use a value that starts with `assets://`, to display an icon from the Atomic package.
   * - Use a stringified SVG to display it directly.
   */
  @property({reflect: true, attribute: 'next-button-icon', type: String})
  nextButtonIcon = ArrowRightIcon;

  public pager!: Pagination;
  public listingOrSearch!: ProductListing | Search;

  public initialize() {
    this.validateProps();
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

  private validateProps() {
    new Schema({
      numberOfPages: new NumberValue({min: 0}),
    }).validate({
      numberOfPages: this.numberOfPages,
    });
  }

  private radioGroupName = randomID('atomic-commerce-pager-');

  @bindingGuard()
  @errorGuard()
  render() {
    const pagesRange = getCurrentPagesRange(
      this.pagerState.page,
      this.numberOfPages,
      this.pagerState.totalPages - 1
    );
    return html`${renderPagerGuard({
      props: {
        hasItems: this.pagerState.totalPages > 1,
        isAppLoaded: this.isAppLoaded,
      },
    })(
      html`${renderPagerNavigation({
        props: {
          i18n: this.bindings.i18n,
        },
      })(html`
        ${renderPagerPreviousButton({
          props: {
            icon: this.previousButtonIcon,
            disabled: this.pagerState.page === 0,
            i18n: this.bindings.i18n,
            onClick: () => {
              this.pager.previousPage();
              this.focusOnFirstResultAndScrollToTop();
            },
          },
        })}
        ${renderPageButtons({
          props: {
            i18n: this.bindings.i18n,
          },
        })(
          html`${pagesRange.map((pageNumber) =>
            renderPagerPageButton({
              props: {
                isSelected: pageNumber === this.pagerState.page,
                ariaLabel: this.bindings.i18n.t('page-number', {
                  pageNumber: pageNumber + 1,
                }),
                onChecked: () => {
                  this.pager.selectPage(pageNumber);
                  this.focusOnFirstResultAndScrollToTop();
                },
                page: pageNumber,
                groupName: this.radioGroupName,
                text: (pageNumber + 1).toLocaleString(
                  this.bindings.i18n.language
                ),
              },
            })
          )}`
        )}
        ${renderPagerNextButton({
          props: {
            icon: this.nextButtonIcon,
            disabled: this.pagerState.page + 1 >= this.pagerState.totalPages,
            i18n: this.bindings.i18n,
            onClick: () => {
              this.pager.nextPage();
              this.focusOnFirstResultAndScrollToTop();
            },
          },
        })}
      `)}`
    )}`;
  }

  private async focusOnFirstResultAndScrollToTop() {
    await this.bindings.store.state.resultList?.focusOnFirstResultAfterNextSearch();
    this.dispatchEvent(new CustomEvent('atomic/scrollToTop'));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-commerce-pager': AtomicCommercePager;
  }
}
