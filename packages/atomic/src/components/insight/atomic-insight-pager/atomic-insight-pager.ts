import {
  buildPager as buildInsightPager,
  buildSearchStatus as buildInsightSearchStatus,
  type Pager as InsightPager,
  type PagerState as InsightPagerState,
  type SearchStatus as InsightSearchStatus,
  type SearchStatusState as InsightSearchStatusState,
} from '@coveo/headless/insight';
import {css, html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {bindStateToController} from '@/src/decorators/bind-state';
import {bindings} from '@/src/decorators/bindings';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import {randomID} from '@/src/utils/utils';
import ArrowLeftIcon from '../../../images/arrow-left-rounded.svg';
import ArrowRightIcon from '../../../images/arrow-right-rounded.svg';
import {
  renderPageButtons,
  renderPagerNextButton,
  renderPagerPageButton,
  renderPagerPreviousButton,
} from '../../common/pager/pager-buttons';
import {renderPagerNavigation} from '../../common/pager/pager-navigation';
import type {InsightBindings} from '../atomic-insight-interface/atomic-insight-interface';

/**
 * @internal
 */
@customElement('atomic-insight-pager')
@bindings()
@withTailwindStyles
export class AtomicInsightPager
  extends LitElement
  implements InitializableComponent<InsightBindings>
{
  static styles = css`
    :host {
      background-color: var(--cov-neutral-light);
      box-sizing: content-box;
      display: flex;
      height: 100%;
      align-items: center;
      justify-content: center;
      padding: 1rem 1.5rem;
    }

    [part='page-button'] {
      background-color: transparent;
    }
  `;

  @state()
  public bindings!: InsightBindings;

  public pager!: InsightPager;
  public searchStatus!: InsightSearchStatus;

  @bindStateToController('pager')
  @state()
  public pagerState!: InsightPagerState;

  @bindStateToController('searchStatus')
  @state()
  public searchStatusState!: InsightSearchStatusState;

  @state() error!: Error;

  /**
   * Specifies how many page buttons to display in the pager.
   */
  @property({type: Number, reflect: true, attribute: 'number-of-pages'})
  numberOfPages = 5;

  private radioGroupName = randomID('atomic-insight-pager-');

  public initialize() {
    this.searchStatus = buildInsightSearchStatus(this.bindings.engine);
    this.pager = buildInsightPager(this.bindings.engine, {
      options: {numberOfPages: this.numberOfPages},
    });
  }

  private async focusOnFirstResultAndScrollToTop() {
    await this.bindings.store.state.resultList?.focusOnFirstResultAfterNextSearch();
    this.dispatchEvent(
      new CustomEvent('atomic/scrollToTop', {
        bubbles: true,
        composed: true,
      })
    );
  }

  public render() {
    return html`
      ${renderPagerNavigation({
        props: {i18n: this.bindings.i18n},
      })(html`
        ${renderPagerPreviousButton({
          props: {
            icon: ArrowLeftIcon,
            disabled: !this.pagerState.hasPreviousPage,
            i18n: this.bindings.i18n,
            onClick: () => {
              this.pager.previousPage();
              this.focusOnFirstResultAndScrollToTop();
            },
          },
        })}
        ${renderPageButtons({
          props: {i18n: this.bindings.i18n},
        })(html`
          ${this.pagerState.currentPages.map((pageNumber) => {
            return renderPagerPageButton({
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
            });
          })}
        `)}
        ${renderPagerNextButton({
          props: {
            icon: ArrowRightIcon,
            disabled: !this.pagerState.hasNextPage,
            i18n: this.bindings.i18n,
            onClick: () => {
              this.pager.nextPage();
              this.focusOnFirstResultAndScrollToTop();
            },
          },
        })}
      `)}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-insight-pager': AtomicInsightPager;
  }
}
