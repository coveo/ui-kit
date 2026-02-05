import {NumberValue} from '@coveo/bueno';
import {
  type IPXActionsHistoryActionCreators,
  loadIPXActionsHistoryActions,
} from '@coveo/headless';
import {
  buildRecommendationList,
  buildInteractiveResult as buildRecsInteractiveResult,
  loadConfigurationActions,
  type RecommendationList,
  type RecommendationListState,
  type Result as RecsResult,
} from '@coveo/headless/recommendation';
import {type CSSResultGroup, css, html, LitElement, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {keyed} from 'lit/directives/keyed.js';
import {map} from 'lit/directives/map.js';
import {when} from 'lit/directives/when.js';
import {renderItemPlaceholders} from '@/src/components/common/atomic-result-placeholder/item-placeholders';
import {renderCarousel} from '@/src/components/common/carousel';
import {renderHeading} from '@/src/components/common/heading';
import {createAppLoadedListener} from '@/src/components/common/interface/store';
import {renderDisplayWrapper} from '@/src/components/common/item-list/display-wrapper';
import {renderGridLayout} from '@/src/components/common/item-list/grid-layout';
import {
  ItemListCommon,
  type ItemRenderingFunction,
} from '@/src/components/common/item-list/item-list-common';
import {ResultTemplateProvider} from '@/src/components/common/item-list/result-template-provider';
import {
  getItemListDisplayClasses,
  type ItemDisplayBasicLayout,
  type ItemDisplayDensity,
  type ItemDisplayImageSize,
} from '@/src/components/common/layout/item-layout-utils';
import type {RecsBindings} from '@/src/components/recommendations/atomic-recs-interface/interfaces';
import {bindStateToController} from '@/src/decorators/bind-state';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {watch} from '@/src/decorators/watch';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import {ChildrenUpdateCompleteMixin} from '@/src/mixins/children-update-complete-mixin';
import {FocusTargetController} from '@/src/utils/accessibility-utils';
import {randomID} from '@/src/utils/utils';
import placeholderStyles from '../../common/item-list/styles/placeholders.tw.css';
import '@/src/components/recommendations/atomic-recs-result/atomic-recs-result';

/**
 * The `atomic-ipx-recs-list` component displays recommendations by applying one or more result templates.
 *
 * @part result-list - The element containing the list of results.
 * @part result-list-grid-clickable-container - The parent of the result and the clickable link encompassing it.
 * @part result-list-grid-clickable - The clickable link encompassing the result.
 * @part label - The label of the result list.
 * @part previous-button - The previous button.
 * @part next-button - The next button.
 * @part indicators - The list of indicators.
 * @part indicator - A single indicator.
 * @part active-indicator - The active indicator.
 *
 * @slot default - The default slot where the result templates are defined.
 *
 * @cssprop --atomic-recs-number-of-columns - The number of columns in the grid.
 */
@customElement('atomic-ipx-recs-list')
@bindings()
@withTailwindStyles
export class AtomicIpxRecsList
  extends ChildrenUpdateCompleteMixin(LitElement)
  implements InitializableComponent<RecsBindings>
{
  static styles: CSSResultGroup = [
    placeholderStyles,
    css`
      @reference '../../../utils/tailwind.global.tw.css';

      :host {
        @apply block;

        .list-root {
          display: grid;
          grid-template-columns: repeat(
            var(--atomic-recs-number-of-columns, 1),
            minmax(0, 1fr)
          );
        }

        [part='label'] {
          @apply font-sans text-2xl font-bold;
        }
      }
    `,
  ];

  public recommendationList!: RecommendationList;

  private actionsHistoryActions?: IPXActionsHistoryActionCreators;
  private itemRenderingFunction: ItemRenderingFunction;
  private itemListCommon!: ItemListCommon;
  private itemTemplateProvider!: ResultTemplateProvider;
  private loadingFlag = randomID('firstRecommendationLoaded-');
  private nextNewResultTarget?: FocusTargetController;

  @state()
  bindings!: RecsBindings;
  @state()
  error!: Error;
  @state()
  private currentPage = 0;
  @state()
  private isAppLoaded = false;
  @state()
  private isEveryResultReady = false;
  @state()
  private resultTemplateRegistered = false;
  @state()
  private templateHasError = false;

  @bindStateToController('recommendationList')
  @state()
  public recommendationListState!: RecommendationListState;

  /**
   * The Recommendation identifier used by the Coveo platform to retrieve recommended documents.
   * Make sure to set a different value for each atomic-ipx-recs-list in your page.
   */
  @property({reflect: true, type: String})
  public recommendation = 'Recommendation';

  /**
   * The layout to apply when displaying results themselves. This does not affect the display of the surrounding list itself.
   * To modify the number of recommendations per column, modify the --atomic-recs-number-of-columns CSS variable.
   */
  @property({reflect: true, type: String})
  public display: ItemDisplayBasicLayout = 'list';

  /**
   * The spacing of various elements in the result list, including the gap between results, the gap between parts of a result, and the font sizes of different parts in a result.
   */
  @property({reflect: true, type: String})
  public density: ItemDisplayDensity = 'normal';

  /**
   * The expected size of the image displayed in the results.
   */
  @property({reflect: true, attribute: 'image-size', type: String})
  public imageSize: ItemDisplayImageSize = 'small';

  /**
   * The total number of recommendations to display.
   * This does not modify the number of recommendations per column. To do so, modify the --atomic-recs-number-of-columns CSS variable.
   */
  @property({
    reflect: true,
    attribute: 'number-of-recommendations',
    type: Number,
  })
  public numberOfRecommendations = 10;

  /**
   * The number of recommendations to display, per page.
   * Setting a value greater than 0 and lower than the numberOfRecommendations value activates the carousel.
   * This does not affect the display of the list itself, only the number of recommendation pages.
   */
  @property({
    reflect: true,
    attribute: 'number-of-recommendations-per-page',
    type: Number,
  })
  public numberOfRecommendationsPerPage?: number;

  /**
   * The non-localized label for the list of recommendations.
   */
  @property({reflect: true, type: String})
  public label?: string;

  /**
   * The [heading level](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Heading_Elements) to use for the heading label, from 1 to 6.
   * When set to 0, a `div` will be used instead of a Heading Element.
   */
  @property({reflect: true, attribute: 'heading-level', type: Number})
  public headingLevel = 0;

  @watch('numberOfRecommendationsPerPage')
  public watchNumberOfRecommendationsPerPage() {
    this.currentPage = 0;
  }

  /**
   * Sets a rendering function to bypass the standard HTML template mechanism for rendering results.
   * You can use this function while working with web frameworks that don't use plain HTML syntax such as React, Angular, or Vue.
   *
   * Do not use this method if you integrate Atomic in a plain HTML deployment.
   *
   * @param resultRenderingFunction
   */
  public async setRenderFunction(
    resultRenderingFunction: ItemRenderingFunction
  ) {
    this.itemRenderingFunction = resultRenderingFunction;
  }

  /**
   * Moves to the previous page, when the carousel is activated.
   */
  public async previousPage() {
    this.currentPage =
      this.currentPage - 1 < 0 ? this.numberOfPages - 1 : this.currentPage - 1;
  }

  /**
   * Moves to the next page, when the carousel is activated.
   */
  public async nextPage() {
    this.currentPage = (this.currentPage + 1) % this.numberOfPages;
  }

  public initialize() {
    this.validateNumberOfRecommendationsPerPage();
    this.validateRecommendationIdentifier();
    this.updateOriginLevel2();

    this.recommendationList = buildRecommendationList(this.bindings.engine, {
      options: {
        id: this.recommendation,
        numberOfRecommendations: this.numberOfRecommendations,
      },
    });

    this.itemTemplateProvider = new ResultTemplateProvider({
      includeDefaultTemplate: true,
      templateElements: Array.from(
        this.querySelectorAll('atomic-recs-result-template')
      ),
      getResultTemplateRegistered: () => this.resultTemplateRegistered,
      getTemplateHasError: () => this.templateHasError,
      setResultTemplateRegistered: (value: boolean) => {
        this.resultTemplateRegistered = value;
      },
      setTemplateHasError: (value: boolean) => {
        this.templateHasError = value;
      },
      bindings: this.bindings,
    });

    this.itemListCommon = new ItemListCommon({
      engineSubscribe: this.bindings.engine.subscribe,
      getCurrentNumberOfItems: () =>
        this.recommendationListState.recommendations.length,
      getIsLoading: () => this.recommendationListState.isLoading,
      host: this,
      loadingFlag: this.loadingFlag,
      nextNewItemTarget: this.focusTarget,
      store: this.bindings.store,
    });

    this.actionsHistoryActions = loadIPXActionsHistoryActions(
      this.bindings.engine
    );

    createAppLoadedListener(this.bindings.store, (isAppLoaded) => {
      this.isAppLoaded = isAppLoaded;
    });
  }

  public disconnectedCallback() {
    super.disconnectedCallback();
  }

  public async updated(changedProperties: Map<string, unknown>) {
    super.updated(changedProperties);
    if (
      changedProperties.has('recommendationListState') &&
      this.isEveryResultReady
    ) {
      this.isEveryResultReady = false;
    }
    await this.updateResultsReadyState();
  }

  private async updateResultsReadyState() {
    if (
      this.isAppLoaded &&
      !this.isEveryResultReady &&
      this.recommendationListStateWithAugment.firstRequestExecuted &&
      this.recommendationListState?.recommendations?.length > 0
    ) {
      await this.getUpdateComplete();
      this.isEveryResultReady = true;
    }
  }

  private get focusTarget() {
    if (!this.nextNewResultTarget) {
      this.nextNewResultTarget = new FocusTargetController(this, this.bindings);
    }
    return this.nextNewResultTarget;
  }

  private get recommendationListStateWithAugment() {
    return {
      ...this.recommendationListState,
      firstRequestExecuted:
        this.recommendationListState.searchResponseId !== '',
      hasError: this.recommendationListState.error !== null,
      hasItems: this.recommendationListState.recommendations.length !== 0,
      results: this.subsetRecommendations,
    };
  }

  private validateNumberOfRecommendationsPerPage() {
    if (this.numberOfRecommendationsPerPage === undefined) {
      return;
    }

    const msg = new NumberValue({
      min: 1,
      max: this.numberOfRecommendations - 1,
    }).validate(this.numberOfRecommendationsPerPage);

    if (msg) {
      this.error = new Error(
        `The "numberOfRecommendationsPerPage" is invalid: ${msg}`
      );
    }
  }

  private validateRecommendationIdentifier() {
    const recListWithRecommendation = document.querySelectorAll(
      `atomic-ipx-recs-list[recommendation="${this.recommendation}"]`
    );

    if (recListWithRecommendation.length > 1) {
      this.bindings.engine.logger.warn(
        `There are multiple atomic-ipx-recs-list in this page with the same recommendation property "${this.recommendation}". Make sure to set a different recommendation property for each.`
      );
    }
  }

  private updateOriginLevel2() {
    if (this.label) {
      const action = loadConfigurationActions(
        this.bindings.engine
      ).setOriginLevel2({
        originLevel2: this.label,
      });

      this.bindings.engine.dispatch(action);
    }
  }

  private get currentIndex() {
    if (!this.recommendationListState.recommendations.length) {
      return 0;
    }
    return Math.abs(
      (this.currentPage * this.numberOfRecommendationsPerPage!) %
        this.recommendationListState.recommendations.length
    );
  }

  private get subsetRecommendations() {
    if (!this.numberOfRecommendationsPerPage) {
      return this.recommendationListState.recommendations;
    }

    return this.recommendationListState.recommendations.slice(
      this.currentIndex,
      this.currentIndex + this.numberOfRecommendationsPerPage
    );
  }

  private get numberOfPages() {
    if (!this.numberOfRecommendationsPerPage) {
      return 1;
    }
    return Math.ceil(
      this.recommendationListState.recommendations.length /
        this.numberOfRecommendationsPerPage
    );
  }

  private get hasPagination() {
    return !!this.numberOfRecommendationsPerPage && this.numberOfPages > 1;
  }

  private get shouldRenderPagination() {
    return (
      this.hasPagination && this.recommendationListStateWithAugment.hasItems
    );
  }

  private get hasNoResults() {
    return (
      !this.recommendationListState.isLoading &&
      this.recommendationListStateWithAugment.results.length === 0
    );
  }

  private onSelect(recommendation: RecsResult, originalSelect: () => void) {
    if (recommendation.raw.permanentid && this.actionsHistoryActions) {
      const action =
        this.actionsHistoryActions.addPageViewEntryInActionsHistory(
          recommendation.raw.permanentid
        );
      this.bindings.engine.dispatch(action);
    }
    originalSelect();
  }

  private getPropsForAtomicRecsResult(recommendation: RecsResult) {
    const interactiveResult = buildRecsInteractiveResult(this.bindings.engine, {
      options: {result: recommendation},
    });
    const originalSelect = interactiveResult.select;
    interactiveResult.select = () => {
      this.onSelect(recommendation, originalSelect);
    };
    const linkContent =
      this.itemTemplateProvider.getLinkTemplateContent(recommendation);

    return {
      interactiveResult,
      result: recommendation,
      renderingFunction: this.itemRenderingFunction,
      loadingFlag: this.loadingFlag,
      key: this.itemListCommon.getResultId(
        recommendation.uniqueId,
        this.recommendationListState.searchResponseId,
        this.density,
        this.imageSize
      ),
      content: this.itemTemplateProvider.getTemplateContent(recommendation),
      linkContent,
      stopPropagation: !!linkContent,
      store: this.bindings.store,
      density: this.density,
      display: this.display,
      imageSize: this.imageSize,
    };
  }

  private computeListDisplayClasses() {
    const displayPlaceholders = !(this.isAppLoaded && this.isEveryResultReady);

    return getItemListDisplayClasses(
      'grid',
      this.density,
      this.imageSize,
      this.recommendationListState.isLoading,
      displayPlaceholders
    );
  }

  private renderHeading() {
    if (!this.label) {
      return nothing;
    }

    if (this.recommendationListStateWithAugment.hasError) {
      return nothing;
    }

    if (!this.isEveryResultReady && this.isAppLoaded) {
      return html`
        <div
          aria-hidden="true"
          class="bg-neutral my-2 h-8 w-60 animate-pulse rounded"
        ></div>
      `;
    }

    if (
      this.recommendationListStateWithAugment.firstRequestExecuted &&
      !this.recommendationListStateWithAugment.hasItems
    ) {
      return nothing;
    }

    return html`${renderHeading({
      props: {
        level: this.headingLevel,
        part: 'label',
        class: 'm-0 mb-2',
      },
    })(html`${this.bindings.i18n.t(this.label)}`)}`;
  }

  private renderAsGrid() {
    return html`${map(this.subsetRecommendations, (recommendation, index) => {
      const props = this.getPropsForAtomicRecsResult(recommendation);
      return renderGridLayout({
        props: {
          selectorForItem: 'atomic-recs-result',
          item: {
            ...recommendation,
            clickUri: recommendation.clickUri,
            title: recommendation.title ?? '',
          },
          ...props.interactiveResult,
          setRef: (element) => {
            element &&
              this.itemListCommon.setNewResultRef(
                element as HTMLElement,
                index
              );
          },
        },
      })(
        html`${keyed(
          props.key,
          html`<atomic-recs-result
            .content=${props.content}
            .density=${props.density}
            .display=${props.display}
            .imageSize=${props.imageSize}
            .linkContent=${props.linkContent}
            .loadingFlag=${props.loadingFlag}
            .interactiveResult=${props.interactiveResult}
            .result=${props.result}
            .renderingFunction=${props.renderingFunction}
            .store=${props.store as never}
          ></atomic-recs-result>`
        )}`
      );
    })}`;
  }

  private renderRecommendationList() {
    this.itemListCommon.updateBreakpoints();
    const listClasses = this.computeListDisplayClasses();

    if (!this.resultTemplateRegistered || this.error) {
      return nothing;
    }

    const resultClasses = `${listClasses} ${!this.isEveryResultReady && 'hidden'}`;

    // Results must be rendered immediately (though hidden) to start their initialization and loading processes.
    // If we wait to render results until placeholders are removed, the components won't begin loading until then,
    // causing a longer delay. The `isEveryResultReady` flag hides results while preserving placeholders,
    // then removes placeholders once results are fully loaded to prevent content flash.
    return html`
      ${when(this.isAppLoaded, () =>
        renderDisplayWrapper({
          props: {listClasses: resultClasses, display: 'list'},
        })(html`${this.renderAsGrid()}`)
      )}
      ${when(!this.isEveryResultReady, () =>
        renderDisplayWrapper({
          props: {listClasses, display: 'list'},
        })(
          renderItemPlaceholders({
            props: {
              density: this.density,
              display: this.display,
              imageSize: this.imageSize,
              numberOfPlaceholders:
                this.numberOfRecommendationsPerPage ??
                this.numberOfRecommendations,
            },
          })
        )
      )}
    `;
  }

  private get shouldRender() {
    if (!this.resultTemplateRegistered || this.error) {
      return false;
    }
    if (this.hasNoResults) {
      this.bindings.store.unsetLoadingFlag(this.loadingFlag);
      return false;
    }
    return true;
  }

  @bindingGuard()
  @errorGuard()
  render() {
    return html`${when(
      this.shouldRender,
      () =>
        html`${when(
          this.templateHasError,
          () => html`<slot></slot>`,
          () =>
            html`${this.renderHeading()}
            ${when(
              this.shouldRenderPagination,
              () =>
                renderCarousel({
                  props: {
                    bindings: this.bindings,
                    previousPage: () => this.previousPage(),
                    nextPage: () => this.nextPage(),
                    numberOfPages: this.numberOfPages,
                    currentPage: this.currentPage,
                    ariaLabel: this.label
                      ? this.bindings.i18n.t(this.label)
                      : undefined,
                  },
                })(
                  html`<div class="px-3">${this.renderRecommendationList()}</div>`
                ),
              () => this.renderRecommendationList()
            )}`
        )}`,
      () => nothing
    )}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-ipx-recs-list': AtomicIpxRecsList;
  }
}
