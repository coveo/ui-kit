import {
  buildRecommendationList,
  RecommendationList,
  RecommendationListState,
  loadConfigurationActions,
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
import {RecsBindings} from '../atomic-recs-interface/atomic-recs-interface';
import {randomID} from '../../../utils/utils';
import {ResultListCommon} from '../../common/result-list/result-list-common';
import {ResultTemplateProvider} from '../../common/result-list/result-template-provider';
import {
  ResultDisplayDensity,
  ResultDisplayImageSize,
  ResultDisplayBasicLayout,
} from '../../common/layout/display-options';
import {
  ResultListCommonState,
  ResultRenderingFunction,
} from '../../common/result-list/result-list-common-interface';
import {
  FocusTarget,
  FocusTargetController,
} from '../../../utils/accessibility-utils';
import {Heading} from '../../common/heading';
import {buildRecsInteractiveResult, RecsResult} from '..';
import ArrowRight from '../../../images/arrow-right.svg';
import {Button} from '../../common/button';
import {NumberValue} from '@coveo/bueno';

/**
 * @internal
 * The `atomic-recs-list` component displays recommendations by applying one or more result templates.
 *
 * @part result-list - The element containing the list of results.
 * @part result-list-grid-clickable-container - The parent of the result & the clickable link encompassing it.
 * @part result-list-grid-clickable - The clickable link encompassing the result.
 * @part label - The label of the result list.
 * @part previous-button - The previous button.
 * @part next-button - The next button.
 * @part indicators - The list of indicators.
 * @part indicator - A single indicator.
 * @part active-indicator - The active indicator.
 */
@Component({
  tag: 'atomic-recs-list',
  styleUrl: 'atomic-recs-list.pcss',
  shadow: true,
})
export class AtomicRecsList implements InitializableComponent<RecsBindings> {
  @InitializeBindings() public bindings!: RecsBindings;
  public recommendationList!: RecommendationList;
  private resultListCommon!: ResultListCommon;
  private loadingFlag = randomID('firstRecommendationLoaded-');
  private resultRenderingFunction: ResultRenderingFunction;

  @Element() public host!: HTMLDivElement;

  @State() public error!: Error;
  @State() private resultTemplateRegistered = false;
  @State() private templateHasError = false;
  @State() private currentPage = 0;
  @BindStateToController('recommendationList')
  @State()
  public recommendationListState!: RecommendationListState;

  @FocusTarget()
  private nextNewResultTarget!: FocusTargetController;

  /**
   * The Recommendation identifier used by the Coveo platform to retrieve recommended documents.
   * Make sure to set a different value for each atomic-recs-list in your page.
   */
  @Prop({reflect: true}) public recommendation = 'Recommendation';

  /**
   * The layout to apply when displaying results themselves. This does not affect the display of the surrounding list itself.
   * To modify the number of recommendations per column, modify the --atomic-recs-number-of-columns CSS variable.
   */
  @Prop({reflect: true}) public display: ResultDisplayBasicLayout = 'list';
  /**
   * The spacing of various elements in the result list, including the gap between results, the gap between parts of a result, and the font sizes of different parts in a result.
   */
  @Prop({reflect: true}) public density: ResultDisplayDensity = 'normal';
  /**
   * The expected size of the image displayed in the results.
   */
  @Prop({reflect: true})
  public imageSize: ResultDisplayImageSize = 'small';

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
   * You can use this function while working with web frameworks that don't use plain HTML syntax, e.g., React, Angular or Vue.
   *
   * Do not use this method if you integrate Atomic in a plain HTML deployment.
   *
   * @param resultRenderingFunction
   */
  @Method() public async setRenderFunction(
    resultRenderingFunction: ResultRenderingFunction
  ) {
    this.resultRenderingFunction = resultRenderingFunction;
  }

  /**
   * Moves to the previous page, when the carousel is activated.
   */
  @Method() public async previousPage() {
    this.currentPage =
      this.currentPage - 1 < 0
        ? this.numberOfAvailablePages - 1
        : this.currentPage - 1;
  }

  /**
   * Moves to the next page, when the carousel is activated.
   */
  @Method() public async nextPage() {
    this.currentPage = (this.currentPage + 1) % this.numberOfAvailablePages;
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

    const resultTemplateProvider = new ResultTemplateProvider({
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

    this.resultListCommon = new ResultListCommon({
      resultTemplateProvider,
      getNumberOfPlaceholders: () =>
        this.numberOfRecommendationsPerPage ?? this.numberOfRecommendations,
      host: this.host,
      bindings: this.bindings,
      getDensity: () => this.density,
      getLayoutDisplay: () => 'grid',
      getResultDisplay: () => this.display,
      getImageSize: () => this.imageSize,
      nextNewResultTarget: this.nextNewResultTarget,
      loadingFlag: this.loadingFlag,
      getResultListState: () => this.resultListCommonState,
      getResultRenderingFunction: () => this.resultRenderingFunction,
      renderResult: (props) => (
        <atomic-recs-result {...props}></atomic-recs-result>
      ),
      getInteractiveResult: (result: RecsResult) =>
        buildRecsInteractiveResult(this.bindings.engine, {
          options: {result},
        }),
    });
  }

  private get resultListCommonState(): ResultListCommonState<RecsResult> {
    return {
      firstSearchExecuted: this.recommendationListState.searchResponseId !== '',
      isLoading: this.recommendationListState.isLoading,
      hasError: this.recommendationListState.error !== null,
      hasResults: this.recommendationListState.recommendations.length !== 0,
      results: this.subsetRecommendations,
      searchResponseId: this.recommendationListState.searchResponseId,
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
        `There are multiple atomic-recs-list in this page with the same recommendation propery "${this.recommendation}". Make sure to set a different recommendation property for each.`
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

    if (this.resultListCommonState.hasError) {
      return;
    }

    if (
      this.resultListCommonState.firstSearchExecuted &&
      !this.resultListCommonState.hasResults
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

  private get numberOfAvailablePages() {
    return Math.ceil(
      this.recommendationListState.recommendations.length /
        this.numberOfRecommendationsPerPage!
    );
  }

  private get hasPagination() {
    return !!this.numberOfRecommendationsPerPage;
  }

  private get commonPaginationClasses() {
    return 'w-10 h-10 grid justify-center items-center absolute top-[50%] -translate-y-1/2 z-1 shadow-lg group';
  }

  private get commonArrowClasses() {
    return 'w-3.5 align-middle text-on-background group-hover:text-primary group-focus:text-primary-light';
  }

  private get shouldRenderPagination() {
    return this.hasPagination && this.resultListCommonState.hasResults;
  }

  private renderPreviousButton() {
    if (!this.shouldRenderPagination) {
      return;
    }

    return (
      <Button
        style="outline-primary"
        ariaLabel={this.bindings.i18n.t('previous')}
        onClick={() => this.previousPage()}
        part="previous-button"
        class={`${this.commonPaginationClasses} -translate-x-1/2`}
      >
        <atomic-icon
          icon={ArrowRight}
          class={`${this.commonArrowClasses} rotate-180`}
        ></atomic-icon>
      </Button>
    );
  }

  private renderNextButton() {
    if (!this.shouldRenderPagination) {
      return;
    }

    return (
      <Button
        style="outline-primary"
        ariaLabel={this.bindings.i18n.t('next')}
        onClick={() => this.nextPage()}
        part="next-button"
        class={`${this.commonPaginationClasses} right-0 translate-x-1/2`}
      >
        <atomic-icon
          icon={ArrowRight}
          class={this.commonArrowClasses}
        ></atomic-icon>
      </Button>
    );
  }

  private renderIndicators() {
    if (!this.shouldRenderPagination) {
      return;
    }

    return (
      <ul part="indicators" class="flex gap-2 justify-center mt-6">
        {Array.from({length: this.numberOfAvailablePages}, (_, index) => {
          const isActive =
            index === this.currentPage % this.numberOfAvailablePages;
          return (
            <li
              part={`indicator ${isActive ? 'active-indicator' : ''}`}
              class={`rounded-md h-1 w-12 ${
                isActive ? 'bg-primary' : 'bg-neutral'
              } `}
            ></li>
          );
        })}
      </ul>
    );
  }

  public render() {
    return (
      <Fragment>
        {this.renderHeading()}
        <div class="relative">
          {this.renderPreviousButton()}
          {this.resultListCommon.render()}
          {this.renderNextButton()}
        </div>
        {this.renderIndicators()}
      </Fragment>
    );
  }
}
