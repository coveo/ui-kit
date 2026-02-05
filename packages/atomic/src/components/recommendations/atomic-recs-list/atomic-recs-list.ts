import {NumberValue, Schema, StringValue} from '@coveo/bueno';
import {
  buildRecommendationList,
  buildInteractiveResult as buildRecsInteractiveResult,
  loadConfigurationActions,
  type RecommendationList,
  type RecommendationListState,
  type Result as RecsResult,
} from '@coveo/headless/recommendation';
import {type CSSResultGroup, html, LitElement, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {keyed} from 'lit/directives/keyed.js';
import {map} from 'lit/directives/map.js';
import {ref} from 'lit/directives/ref.js';
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
import gridDisplayStyles from '@/src/components/common/item-list/styles/grid-display.tw.css';
import placeholderStyles from '@/src/components/common/item-list/styles/placeholders.tw.css';
import {
  getItemListDisplayClasses,
  type ItemDisplayBasicLayout,
  type ItemDisplayDensity,
  type ItemDisplayImageSize,
} from '@/src/components/common/layout/item-layout-utils';
import {ValidatePropsController} from '@/src/components/common/validate-props-controller/validate-props-controller';
import type {RecsBindings} from '@/src/components/recommendations/atomic-recs-interface/atomic-recs-interface';
import {bindStateToController} from '@/src/decorators/bind-state';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import {ChildrenUpdateCompleteMixin} from '@/src/mixins/children-update-complete-mixin';
import {FocusTargetController} from '@/src/utils/accessibility-utils';
import {randomID} from '@/src/utils/utils';
import recsListStyles from './atomic-recs-list.tw.css';
import '../atomic-recs-result/atomic-recs-result';

/**
 * The `atomic-recs-list` component displays recommendations by applying one or more result templates.
 *
 * @slot default - The default slot where to insert the template element.
 * @part result-list - The element containing the list of results.
 * @part result-list-grid-clickable-container - The parent of the result and the clickable link encompassing it.
 * @part result-list-grid-clickable - The clickable link encompassing the result.
 * @part label - The label of the result list.
 * @part previous-button - The previous button.
 * @part next-button - The next button.
 * @part indicators - The list of indicators.
 * @part indicator - A single indicator.
 * @part active-indicator - The active indicator.
 */
@customElement('atomic-recs-list')
@bindings()
@withTailwindStyles
export class AtomicRecsList
  extends ChildrenUpdateCompleteMixin(LitElement)
  implements InitializableComponent<RecsBindings>
{
  static styles: CSSResultGroup = [
    placeholderStyles,
    gridDisplayStyles,
    recsListStyles,
  ];

  private static readonly propsSchema = new Schema({
    density: new StringValue({
      constrainTo: ['normal', 'comfortable', 'compact'],
    }),
    display: new StringValue({constrainTo: ['grid', 'list']}),
    imageSize: new StringValue({
      constrainTo: ['small', 'large', 'icon', 'none'],
    }),
  });

  public recommendationList!: RecommendationList;

  private itemRenderingFunction: ItemRenderingFunction;
  private loadingFlag = randomID('firstRecommendationLoaded-');
  private nextNewResultTarget?: FocusTargetController;
  private itemListCommon!: ItemListCommon;
  private itemTemplateProvider!: ResultTemplateProvider;

  @state()
  bindings!: RecsBindings;
  @state()
  error!: Error;
  @state()
  private isAppLoaded = false;
  @state()
  private isEveryResultReady = false;
  @state()
  private resultTemplateRegistered = false;
  @state()
  private templateHasError = false;
  @state()
  private currentPage = 0;

  @bindStateToController('recommendationList')
  @state()
  private recommendationListState!: RecommendationListState;

  /**
   * The Recommendation identifier used by the Coveo platform to retrieve recommended documents.
   * Make sure to set a different value for each atomic-recs-list in your page.
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
   */
  @property({reflect: true, attribute: 'heading-level', type: Number})
  public headingLevel = 0;

  constructor() {
    super();

    new ValidatePropsController(
      this,
      () => ({
        density: this.density,
        display: this.display,
        imageSize: this.imageSize,
      }),
      AtomicRecsList.propsSchema,
      // TODO V4: KIT-5197 - Remove false
      false
    );
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

    this.initResultTemplateProvider();
    this.initItemListCommon();

    createAppLoadedListener(this.bindings.store, (isAppLoaded) => {
      this.isAppLoaded = isAppLoaded;
    });
  }

  public async willUpdate(changedProperties: Map<string, unknown>) {
    super.willUpdate(changedProperties);

    if (changedProperties.has('numberOfRecommendationsPerPage')) {
      this.currentPage = 0;
    }

    if (changedProperties.has('recommendationListState')) {
      const oldState = changedProperties.get(
        'recommendationListState'
      ) as RecommendationListState;
      if (this.recommendationListState.searchResponseId !== '') {
        this.bindings.store.unsetLoadingFlag(this.loadingFlag);
      }
      if (!oldState?.isLoading && this.recommendationListState.isLoading) {
        this.isEveryResultReady = false;
      }
    }

    await this.updateResultReadyState();
  }

  private async updateResultReadyState() {
    if (
      this.isAppLoaded &&
      !this.isEveryResultReady &&
      this.recommendationListState?.searchResponseId !== '' &&
      this.recommendationListState?.recommendations?.length > 0
    ) {
      await this.getUpdateComplete();
      this.isEveryResultReady = true;
    }
  }

  @bindingGuard()
  @errorGuard()
  render() {
    if (!this.resultTemplateRegistered || this.templateHasError || this.error) {
      return nothing;
    }

    const listContent = this.renderListOfRecommendations();

    return html`
      ${this.renderHeading()}
      ${when(
        this.shouldRenderPagination,
        () =>
          renderCarousel({
            props: {
              bindings: this.bindings,
              currentPage: this.currentPage,
              nextPage: () => this.nextPage(),
              previousPage: () => this.previousPage(),
              numberOfPages: this.numberOfPages,
              ariaLabel: this.label
                ? this.bindings.i18n.t(this.label)
                : this.bindings.i18n.t('recommendations'),
            },
          })(listContent),
        () => listContent
      )}
    `;
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

  private get currentIndex() {
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
    return Math.ceil(
      this.recommendationListState.recommendations.length /
        this.numberOfRecommendationsPerPage!
    );
  }

  private get hasPagination() {
    return this.numberOfPages > 1;
  }

  private get shouldRenderPagination() {
    return (
      this.hasPagination && this.recommendationListStateWithAugment.hasItems
    );
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
      `atomic-recs-list[recommendation="${this.recommendation}"]`
    );

    if (recListWithRecommendation.length > 1) {
      this.bindings.engine.logger.warn(
        `There are multiple atomic-recs-list in this page with the same recommendation property "${this.recommendation}". Make sure to set a different recommendation property for each.`
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

  private initResultTemplateProvider() {
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
  }

  private initItemListCommon() {
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
  }

  private computeListDisplayClasses() {
    const displayPlaceholders = !(this.isAppLoaded && this.isEveryResultReady);

    return getItemListDisplayClasses(
      'grid',
      this.density,
      this.imageSize,
      this.recommendationListState?.isLoading,
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

    if (
      this.recommendationListStateWithAugment.firstRequestExecuted &&
      !this.recommendationListStateWithAugment.hasItems
    ) {
      return nothing;
    }

    return renderHeading({
      props: {
        level: this.headingLevel,
        part: 'label',
        class: 'm-0 mb-2',
      },
    })(html`${this.bindings.i18n.t(this.label)}`);
  }

  private renderListOfRecommendations() {
    const listClasses = this.computeListDisplayClasses();
    const resultClasses = `${listClasses} ${!this.isEveryResultReady && 'hidden'}`;

    // Results must be rendered immediately (though hidden) to start their initialization and loading processes.
    // If we wait to render results until placeholders are removed, the components won't begin loading until then,
    // causing a longer delay. The `isEveryResultReady` flag hides results while preserving placeholders,
    // then removes placeholders once results are fully loaded to prevent content flash.
    return html`
      ${when(this.isAppLoaded, () =>
        renderDisplayWrapper({
          props: {
            listClasses: resultClasses,
            display: 'grid',
          },
        })(html`${this.renderGrid()}`)
      )}
      ${when(!this.isEveryResultReady, () =>
        renderDisplayWrapper({
          props: {listClasses, display: 'grid'},
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

  private renderGrid() {
    return html`${map(this.subsetRecommendations, (recommendation, index) => {
      return renderGridLayout({
        props: {
          item: {
            ...recommendation,
            title: recommendation.title ?? '',
          },
          selectorForItem: 'atomic-recs-result',
          setRef: (element) => {
            element instanceof HTMLElement &&
              this.itemListCommon.setNewResultRef(element, index);
          },
        },
      })(
        html`${keyed(
          this.getResultId(recommendation),
          html`<atomic-recs-result
            .content=${this.getContent(recommendation)}
            .density=${this.density}
            .display=${this.display}
            .imageSize=${this.imageSize}
            .interactiveResult=${this.getInteractiveResult(recommendation)}
            .linkContent=${this.getLinkContent(recommendation)}
            .loadingFlag=${this.loadingFlag}
            .result=${recommendation}
            .renderingFunction=${this.itemRenderingFunction}
            .store=${this.bindings.store as never}
          ></atomic-recs-result>`
        )}`
      );
    })}`;
  }

  private getLinkContent(result: RecsResult) {
    return this.itemTemplateProvider.getLinkTemplateContent(result);
  }

  private getContent(result: RecsResult) {
    return this.itemTemplateProvider.getTemplateContent(result);
  }

  private getInteractiveResult(result: RecsResult) {
    return buildRecsInteractiveResult(this.bindings.engine, {
      options: {result},
    });
  }

  private getResultId(result: RecsResult) {
    return this.itemListCommon.getResultId(
      result.uniqueId,
      this.recommendationListState.searchResponseId,
      this.density,
      this.imageSize
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-recs-list': AtomicRecsList;
  }
}
