import {Component, h, Element, State, Prop, Method} from '@stencil/core';
import {
  InsightResultList,
  InsightResultListState,
  buildInsightResultList,
  InsightResult,
  buildInsightInteractiveResult,
  buildInsightResultsPerPage,
  InsightResultsPerPage,
  InsightResultsPerPageState,
} from '../..';
import {FocusTargetController} from '../../../../utils/accessibility-utils';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {randomID} from '../../../../utils/utils';
import {ResultsPlaceholdersGuard} from '../../../common/atomic-result-placeholder/placeholders';
import {DisplayWrapper} from '../../../common/item-list/display-wrapper';
import {ItemDisplayGuard} from '../../../common/item-list/item-display-guard';
import {
  ItemListCommon,
  ItemRenderingFunction,
} from '../../../common/item-list/item-list-common';
import {ItemListGuard} from '../../../common/item-list/item-list-guard';
import {ItemTemplateProvider} from '../../../common/item-list/item-template-provider';
import {
  getItemListDisplayClasses,
  ItemDisplayDensity,
  ItemDisplayImageSize,
  ItemDisplayLayout,
} from '../../../common/layout/display-options';
import {InsightBindings} from '../../atomic-insight-interface/atomic-insight-interface';

/**
 * @internal
 */
@Component({
  tag: 'atomic-insight-result-list',
  styleUrl: 'atomic-insight-result-list.pcss',
  shadow: true,
})
export class AtomicInsightResultList
  implements InitializableComponent<InsightBindings>
{
  @InitializeBindings() public bindings!: InsightBindings;
  public resultList!: InsightResultList;
  public resultsPerPage!: InsightResultsPerPage;
  private loadingFlag = randomID('firstInsightResultLoaded-');
  private itemRenderingFunction: ItemRenderingFunction;
  private itemTemplateProvider!: ItemTemplateProvider;
  private nextNewResultTarget?: FocusTargetController;
  private display: ItemDisplayLayout = 'list';
  private itemListCommon!: ItemListCommon;

  @Element() public host!: HTMLDivElement;

  @BindStateToController('resultsPerPage')
  @State()
  public resultsPerPageState!: InsightResultsPerPageState;
  @BindStateToController('resultList')
  @State()
  public resultListState!: InsightResultListState;
  @State() private templateHasError = false;
  @State() private resultTemplateRegistered = false;
  @State() public error!: Error;

  /**
   * The spacing of various elements in the result list, including the gap between results, the gap between parts of a result, and the font sizes of different parts in a result.
   */
  @Prop({reflect: true}) density: ItemDisplayDensity = 'normal';
  /**
   * The expected size of the image displayed in the results.
   */
  @Prop({reflect: true}) imageSize: ItemDisplayImageSize = 'icon';
  /**
   * Sets a rendering function to bypass the standard HTML template mechanism for rendering results.
   * You can use this function while working with web frameworks that don't use plain HTML syntax, e.g., React, Angular or Vue.
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

  public initialize() {
    this.resultList = buildInsightResultList(this.bindings.engine, {
      options: {
        fieldsToInclude: this.bindings.store.state.fieldsToInclude || undefined,
      },
    });
    this.resultsPerPage = buildInsightResultsPerPage(this.bindings.engine);

    this.itemTemplateProvider = new ItemTemplateProvider({
      includeDefaultTemplate: true,
      templateElements: Array.from(
        this.host.querySelectorAll('atomic-insight-result-template')
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
      getCurrentNumberOfItems: () => this.resultListState.results.length,
      getIsLoading: () => this.resultListState.isLoading,
      host: this.host,
      loadingFlag: this.loadingFlag,
      nextNewItemTarget: this.focusTarget,
      store: this.bindings.store,
    });
  }

  public get focusTarget(): FocusTargetController {
    if (!this.nextNewResultTarget) {
      this.nextNewResultTarget = new FocusTargetController(this);
    }
    return this.nextNewResultTarget;
  }

  public render() {
    this.itemListCommon.updateBreakpoints();
    const listClasses = this.computeListDisplayClasses();

    return (
      <ItemListGuard
        hasTemplate={this.resultTemplateRegistered}
        templateHasError={this.itemTemplateProvider.hasError}
        firstRequestExecuted={this.resultListState.firstSearchExecuted}
        hasItems={this.resultListState.hasResults}
        hasError={this.resultListState.hasError}
      >
        <DisplayWrapper listClasses={listClasses} display={this.display}>
          <ResultsPlaceholdersGuard
            displayPlaceholders={!this.bindings.store.isAppLoaded()}
            numberOfPlaceholders={this.resultsPerPageState.numberOfResults}
            display={this.display}
            density={this.density}
            imageSize={this.imageSize}
          ></ResultsPlaceholdersGuard>
          <ItemDisplayGuard
            firstRequestExecuted={this.resultListState.firstSearchExecuted}
            hasItems={this.resultListState.hasResults}
          >
            {this.resultListState.results.map((result, i) => {
              const atomicInsightResultProps =
                this.getPropsForAtomicInsightResult(result);
              return (
                <atomic-insight-result
                  {...atomicInsightResultProps}
                  part="outline"
                  ref={(element) =>
                    element && this.itemListCommon.setNewResultRef(element, i)
                  }
                ></atomic-insight-result>
              );
            })}
          </ItemDisplayGuard>
        </DisplayWrapper>
      </ItemListGuard>
    );
  }

  private computeListDisplayClasses() {
    const displayPlaceholders = !this.bindings.store.isAppLoaded();

    return getItemListDisplayClasses(
      this.display,
      this.density,
      this.imageSize,
      this.resultListState.firstSearchExecuted &&
        this.resultListState.isLoading,
      displayPlaceholders
    );
  }

  private getPropsForAtomicInsightResult(result: InsightResult) {
    return {
      interactiveResult: buildInsightInteractiveResult(this.bindings.engine, {
        options: {result},
      }),
      result,
      renderingFunction: this.itemRenderingFunction,
      loadingFlag: this.loadingFlag,
      key: this.itemListCommon.getResultId(
        result.uniqueId,
        this.resultListState.searchResponseId,
        this.density,
        this.imageSize
      ),
      content: this.itemTemplateProvider.getTemplateContent(result),
      store: this.bindings.store,
      density: this.density,
      imageSize: this.imageSize,
      display: this.display,
    };
  }
}
