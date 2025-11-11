import {NumberValue} from '@coveo/bueno';
import {
  buildRecommendationList,
  RecommendationList,
  RecommendationListState,
  loadConfigurationActions,
  buildInteractiveResult as buildRecsInteractiveResult,
  Result as RecsResult,
} from '@coveo/headless/recommendation';
import {
  Component,
  State,
  Element,
  Prop,
  Method,
  h,
  Fragment,
  Watch,
} from '@stencil/core';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {FocusTargetController} from '../../../utils/stencil-accessibility-utils';
import {randomID} from '../../../utils/utils';
import {ResultsPlaceholdersGuard} from '../../common/atomic-result-placeholder/stencil-placeholders';
import {createAppLoadedListener} from '../../common/interface/store';
import {ItemDisplayGuard} from '../../common/item-list/stencil-item-display-guard';
import {ResultTemplateProvider} from '../../common/item-list/result-template-provider';
import {DisplayGrid} from '../../common/item-list/stencil-display-grid';
import {DisplayWrapper} from '../../common/item-list/stencil-display-wrapper';
import {
  ItemListCommon,
  ItemRenderingFunction,
} from '../../common/item-list/stencil-item-list-common';
import {
  ItemDisplayDensity,
  ItemDisplayImageSize,
  ItemDisplayBasicLayout,
  getItemListDisplayClasses,
} from '../../common/layout/display-options';
import {Carousel} from '../../common/stencil-carousel';
import {Heading} from '../../common/stencil-heading';
import {RecsBindings} from '../atomic-recs-interface/atomic-recs-interface';

/**
 * The `atomic-recs-list` component displays recommendations by applying one or more result templates.
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
 * @slot default - The default slot where to insert the template element.
 */
@Component({
  tag: 'atomic-recs-list',
  styleUrl: 'atomic-recs-list.pcss',
  shadow: true,
})
export class AtomicRecsList implements InitializableComponent<RecsBindings> {
  @InitializeBindings() public bindings!: RecsBindings;
  public recommendationList!: RecommendationList;
  private loadingFlag = randomID('firstRecommendationLoaded-');
  private itemRenderingFunction: ItemRenderingFunction;
  private itemTemplateProvider!: ResultTemplateProvider;
  private nextNewResultTarget?: FocusTargetController;
  private itemListCommon!: ItemListCommon;

  @Element() public host!: HTMLDivElement;

  @State() public error!: Error;
  @State() private isAppLoaded = false;

  @State() private resultTemplateRegistered = false;
  @State() private templateHasError = false;
  @State() private currentPage = 0;
  @BindStateToController('recommendationList')
  @State()
  public recommendationListState!: RecommendationListState;

  /**
   * The Recommendation identifier used by the Coveo platform to retrieve recommended documents.
   * Make sure to set a different value for each atomic-recs-list in your page.
   */
  @Prop({reflect: true}) public recommendation = 'Recommendation';

  /**
   * The layout to apply when displaying results themselves. This does not affect the display of the surrounding list itself.
   * To modify the number of recommendations per column, modify the --atomic-recs-number-of-columns CSS variable.
   */
  @Prop({reflect: true}) public display: ItemDisplayBasicLayout = 'list';
  /**
   * The spacing of various elements in the result list, including the gap between results, the gap between parts of a result, and the font sizes of different parts in a result.
   */
  @Prop({reflect: true}) public density: ItemDisplayDensity = 'normal';
  /**
   * The expected size of the image displayed in the results.
   */
  @Prop({reflect: true})
  public imageSize: ItemDisplayImageSize = 'small';

  /**
   * The total number of recommendations to display.
   * This does not modify the number of recommendations per column. To do so, modify the --atomic-recs-number-of-columns CSS variable.
   */
  @Prop({reflect: true}) public numberOfRecommendations = 10;

  /**
   * The number of recommendations to display, per page.
   * Setting a value greater than and lower than the numberOfRecommendations value activates the carousel.
   * This does not affect the display of the list itself, only the number of recommendation pages.
   */
  @Prop({reflect: true}) public numberOfRecommendationsPerPage?: number;

  /**
   * The non-localized label for the list of recommendations.
   */
  @Prop({reflect: true}) public label?: string;

  /**
   * The [heading level](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Heading_Elements) to use for the heading label, from 1 to 6.
   */
  @Prop({reflect: true}) public headingLevel = 0;

  @Watch('numberOfRecommendationsPerPage')
  public async watchNumberOfRecommendationsPerPage() {
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
  @Method() public async setRenderFunction(
    resultRenderingFunction: ItemRenderingFunction
  ) {
    this.itemRenderingFunction = resultRenderingFunction;
  }

  /**
   * Moves to the previous page, when the carousel is activated.
   */
  @Method() public async previousPage() {
    this.currentPage =
      this.currentPage - 1 < 0 ? this.numberOfPages - 1 : this.currentPage - 1;
  }

  /**
   * Moves to the next page, when the carousel is activated.
   */
  @Method() public async nextPage() {
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
        this.host.querySelectorAll('atomic-recs-result-template')
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
      host: this.host,
      loadingFlag: this.loadingFlag,
      nextNewItemTarget: this.focusTarget,
      store: this.bindings.store,
    });

    createAppLoadedListener(this.bindings.store, (isAppLoaded) => {
      this.isAppLoaded = isAppLoaded;
    });
  }

  public get focusTarget() {
    if (!this.nextNewResultTarget) {
      this.nextNewResultTarget = new FocusTargetController(this);
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
    const msg = new NumberValue({
      min: 1,
      max: this.numberOfRecommendations - 1,
    }).validate(this.numberOfRecommendationsPerPage!);

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

  private renderHeading() {
    if (!this.label) {
      return;
    }

    if (this.recommendationListStateWithAugment.hasError) {
      return;
    }

    if (
      this.recommendationListStateWithAugment.firstRequestExecuted &&
      !this.recommendationListStateWithAugment.hasItems
    ) {
      return;
    }

    return (
      <Heading level={this.headingLevel} part="label" class="m-0 mb-2">
        {this.bindings.i18n.t(this.label)}
      </Heading>
    );
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

  private getPropsForAtomicRecsResult(recommendation: RecsResult) {
    const linkContent =
      this.itemTemplateProvider.getLinkTemplateContent(recommendation);

    return {
      interactiveResult: buildRecsInteractiveResult(this.bindings.engine, {
        options: {result: recommendation},
      }),
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
    const displayPlaceholders = !this.isAppLoaded;

    return getItemListDisplayClasses(
      'grid',
      this.density,
      this.imageSize,
      this.recommendationListState.isLoading,
      displayPlaceholders
    );
  }

  private renderAsGrid(recommendation: RecsResult, i: number) {
    const propsForAtomicRecsResult =
      this.getPropsForAtomicRecsResult(recommendation);
    return (
      <DisplayGrid
        selectorForItem="atomic-recs-result"
        item={recommendation}
        {...propsForAtomicRecsResult.interactiveResult}
        setRef={(element) =>
          element && this.itemListCommon.setNewResultRef(element, i)
        }
      >
        <atomic-recs-result {...propsForAtomicRecsResult}></atomic-recs-result>
      </DisplayGrid>
    );
  }

  private renderListOfRecommendations() {
    this.itemListCommon.updateBreakpoints();
    const listClasses = this.computeListDisplayClasses();

    if (
      !this.resultTemplateRegistered ||
      this.itemTemplateProvider.hasError ||
      this.error
    ) {
      return;
    }

    return (
      <DisplayWrapper listClasses={listClasses} display="grid">
        <ResultsPlaceholdersGuard
          density={this.density}
          display={this.display}
          imageSize={this.imageSize}
          displayPlaceholders={!this.isAppLoaded}
          numberOfPlaceholders={
            this.numberOfRecommendationsPerPage ?? this.numberOfRecommendations
          }
        ></ResultsPlaceholdersGuard>
        <ItemDisplayGuard {...this.recommendationListStateWithAugment}>
          {this.subsetRecommendations.map((recommendation, i) => {
            return this.renderAsGrid(recommendation, i);
          })}
        </ItemDisplayGuard>
      </DisplayWrapper>
    );
  }

  public render() {
    return (
      <Fragment>
        {this.renderHeading()}
        {this.shouldRenderPagination ? (
          <Carousel
            bindings={this.bindings}
            currentPage={this.currentPage}
            nextPage={() => this.nextPage()}
            previousPage={() => this.previousPage()}
            numberOfPages={this.numberOfPages}
          >
            {this.renderListOfRecommendations()}
          </Carousel>
        ) : (
          this.renderListOfRecommendations()
        )}
      </Fragment>
    );
  }
}
