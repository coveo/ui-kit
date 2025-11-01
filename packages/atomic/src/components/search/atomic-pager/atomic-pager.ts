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
import type {Bindings} from '@/src/components/search/atomic-search-interface/interfaces';
import {bindStateToController} from '@/src/decorators/bind-state';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import {InitializeBindingsMixin} from '@/src/mixins/bindings-mixin';
import {
  AriaLiveRegionController,
  FocusTargetController,
} from '@/src/utils/accessibility-utils';
import {randomID} from '@/src/utils/utils';
import ArrowLeftIcon from '../../../images/arrow-left-rounded.svg';
import ArrowRightIcon from '../../../images/arrow-right-rounded.svg';

/**
 * The `atomic-pager` provides buttons that allow the end user to navigate through the different result pages.
 *
 * @part buttons - The list of the next/previous buttons and page-buttons.
 * @part page-buttons - The list of page buttons.
 * @part page-button - The individual page buttons.
 * @part active-page-button - The active page button.
 * @part previous-button - The previous page button.
 * @part next-button - The next page button.
 * @part previous-button-icon - The icon displayed on the "previous page" button.
 * @part next-button-icon - The icon displayed on the "next page" button.
 *
 * @event atomic/scrollToTop - Emitted when the user clicks any of the buttons rendered by the component.
 */
@customElement('atomic-pager')
@bindings()
@withTailwindStyles
export class AtomicPager
  extends InitializeBindingsMixin(LitElement)
  implements InitializableComponent<Bindings>
{
  @state() public bindings!: Bindings;
  @state() public error!: Error;
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
   * The maximum number of page buttons to display in the pager.
   */
  @property({
    reflect: true,
    useDefault: true,
    attribute: 'number-of-pages',
    type: Number,
  })
  numberOfPages: number = 5;

  /**
   * The SVG icon to render on the "previous page" button.
   *
   * - Use a value that starts with `http://`, `https://`, `./`, or `../`, to fetch and display an icon from a given location.
   * - Use a value that starts with `assets://`, to display an icon from the Atomic package.
   * - Use a stringified SVG to display it directly.
   */
  @property({reflect: true, attribute: 'previous-button-icon', type: String})
  previousButtonIcon: string = ArrowLeftIcon;

  /**
   * The SVG icon to render on the "next page" button.
   *
   * - Use a value that starts with `http://`, `https://`, `./`, or `../`, to fetch and display an icon from a given location.
   * - Use a value that starts with `assets://`, to display an icon from the Atomic package.
   * - Use a stringified SVG to display it directly.
   */
  @property({reflect: true, attribute: 'next-button-icon', type: String})
  nextButtonIcon: string = ArrowRightIcon;

  protected ariaMessage = new AriaLiveRegionController(this, 'atomic-pager');

  private radioGroupName = randomID('atomic-pager-');

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
    this.searchStatus = buildSearchStatus(this.bindings.engine);
    this.pager = buildPager(this.bindings.engine, {
      options: {numberOfPages: this.numberOfPages},
    });
    createAppLoadedListener(this.bindings.store, (isAppLoaded) => {
      this.isAppLoaded = isAppLoaded;
    });
  }

  @bindingGuard()
  @errorGuard()
  render() {
    const currentGroupName = `${this.radioGroupName}-${this.pagerState.currentPages.join('-')}`;

    const pagesRange = getCurrentPagesRange(
      this.pagerState.currentPage - 1,
      this.numberOfPages,
      this.pagerState.maxPage
    );

    return html`${when(
      this.pagerState.maxPage > 1 && this.isAppLoaded,
      () => html`
      ${renderPagerNavigation({
        props: {
          i18n: this.bindings.i18n,
        },
      })(html`
          ${renderPagerPreviousButton({
            props: {
              icon: this.previousButtonIcon,
              disabled: !this.pagerState.hasPreviousPage,
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
                    isSelected: pageNumber === this.pager.state.currentPage - 1,
                    ariaLabel: this.bindings.i18n.t('page-number', {
                      pageNumber: pageNumber + 1,
                    }),
                    onChecked: async () => {
                      this.pager.selectPage(pageNumber + 1);
                      await this.focusOnFirstResultAndScrollToTop();
                    },
                    page: pageNumber,
                    groupName: currentGroupName,
                    text: (pageNumber + 1).toLocaleString(
                      this.bindings.i18n.language
                    ),
                    onFocusCallback: this.handleFocus,
                  },
                })
              )
            )}`)}
          ${renderPagerNextButton({
            props: {
              icon: this.nextButtonIcon,
              disabled: !this.pagerState.hasNextPage,
              i18n: this.bindings.i18n,
              onClick: async () => {
                this.pager.nextPage();
                await this.focusOnFirstResultAndScrollToTop();
              },
              ref: (el) => this.nextButton.setTarget(el as HTMLElement),
            },
          })}
        `)}`
    )}`;
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
      pageNumber: this.pagerState.currentPage,
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-pager': AtomicPager;
  }
}
