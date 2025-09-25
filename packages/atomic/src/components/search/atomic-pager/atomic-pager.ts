import {NumberValue, Schema} from '@coveo/bueno';
import {
  buildPager,
  buildSearchStatus,
  type Pager,
  type PagerState,
  type SearchStatus,
  type SearchStatusState,
} from '@coveo/headless';
import {html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';
import {bindStateToController} from '@/src/decorators/bind-state';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import {InitializeBindingsMixin} from '@/src/mixins/bindings-mixin';
import {randomID} from '@/src/utils/utils';
import ArrowLeftIcon from '../../../images/arrow-left-rounded.svg';
import ArrowRightIcon from '../../../images/arrow-right-rounded.svg';
import {getCurrentPagesRange} from '../../commerce/atomic-commerce-pager/commerce-pager-utils';
import {createAppLoadedListener} from '../../common/interface/store';
import {
  renderPageButtons,
  renderPagerNextButton,
  renderPagerPageButton,
  renderPagerPreviousButton,
} from '../../common/pager/pager-buttons';
import {renderPagerNavigation} from '../../common/pager/pager-navigation';
import type {Bindings} from '../atomic-search-interface/interfaces';

/**
 * The `atomic-pager` provides buttons that allow the end user to navigate through the different result pages.
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
 * @event atomic/scrollToTop - Emitted when the user clicks the next or previous button, or a page button.
 */
@customElement('atomic-pager')
@bindings()

@withTailwindStyles
export class AtomicPager
  extends InitializeBindingsMixin(LitElement)
  implements InitializableComponent<Bindings>
{
  @state()
  bindings!: Bindings;
  @state() error!: Error;
  @state() private isAppLoaded = false;

  public pager!: Pager;
  public searchStatus!: SearchStatus;

  @bindStateToController('pager')
  @state()
  public pagerState!: PagerState;

  @bindStateToController('searchStatus')
  @state()
  public searchStatusState!: SearchStatusState;

  /**
   * Specifies how many page buttons to display in the pager.
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

  private radioGroupName = randomID('atomic-pager-');

  public initialize() {
    this.validateProps();
    this.searchStatus = buildSearchStatus(this.bindings.engine);
    this.pager = buildPager(this.bindings.engine, {
      options: {numberOfPages: this.numberOfPages},
    });
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

  @bindingGuard()
  @errorGuard()
  render() {
    const pagesRange = getCurrentPagesRange(
      this.pagerState.currentPage,
      this.numberOfPages,
      this.pagerState.maxPage - 1
    );
    return html`${when(
      !this.searchStatusState.hasError &&
        this.searchStatusState.hasResults &&
        this.isAppLoaded,
      () =>
        html`${renderPagerNavigation({
          props: {
            i18n: this.bindings.i18n,
          },
        })(html`
          ${renderPagerPreviousButton({
            props: {
              icon: this.previousButtonIcon,
              disabled: !this.pagerState.hasPreviousPage,
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
                  isSelected: this.pager.isCurrentPage(pageNumber),
                  ariaLabel: this.bindings.i18n.t('page-number', {pageNumber}),
                  onChecked: () => {
                    this.pager.selectPage(pageNumber);
                    this.focusOnFirstResultAndScrollToTop();
                  },
                  page: pageNumber,
                  groupName: this.radioGroupName,
                  text: pageNumber.toLocaleString(this.bindings.i18n.language),
                },
              })
            )}`
          )}
          ${renderPagerNextButton({
            props: {
              icon: this.nextButtonIcon,
              disabled: !this.pagerState.hasNextPage,
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
    'atomic-pager': AtomicPager;
  }
}
