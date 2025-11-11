import {
  ResultsPerPageState as InsightResultsPerPageState,
  ResultsPerPage as InsightResultsPerPage,
  buildFoldedResultList as buildInsightFoldedResultList,
  FoldedResultList as InsightFoldedResultList,
  FoldedResultListState as InsightFoldedResultListState,
  buildResultsPerPage as buildInsightResultsPerPage,
  FoldedCollection as InsightFoldedCollection,
  buildInteractiveResult as buildInsightInteractiveResult,
} from '@coveo/headless/insight';
import {
  Component,
  Element,
  State,
  Prop,
  Listen,
  Method,
  h,
} from '@stencil/core';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {FocusTargetController} from '../../../../utils/stencil-accessibility-utils';
import {randomID} from '../../../../utils/utils';
import {ResultsPlaceholdersGuard} from '../../../common/atomic-result-placeholder/stencil-placeholders';
import {extractUnfoldedItem} from '../../../common/item-list/unfolded-item';
import {createAppLoadedListener} from '../../../common/interface/store';
import {ItemDisplayGuard} from '../../../common/item-list/stencil-item-display-guard';
import {FoldedItemListStateContextEvent} from '../../../common/item-list/item-list-decorators';
import {ItemListGuard} from '../../../common/item-list/stencil-item-list-guard';
import {ResultTemplateProvider} from '../../../common/item-list/result-template-provider';
import {DisplayWrapper} from '../../../common/item-list/stencil-display-wrapper';
import {
  ItemListCommon,
  ItemRenderingFunction,
} from '../../../common/item-list/stencil-item-list-common';
import {
  ItemDisplayDensity,
  ItemDisplayImageSize,
  ItemDisplayLayout,
  getItemListDisplayClasses,
} from '../../../common/layout/display-options';
import {InsightBindings} from '../../atomic-insight-interface/atomic-insight-interface';

/**
 * @internal
 */
@Component({
  tag: 'atomic-insight-folded-result-list',
  styleUrl: 'atomic-insight-folded-result-list.pcss',
  shadow: true,
})
export class AtomicInsightFoldedResultList
  implements InitializableComponent<InsightBindings>
{
  @InitializeBindings() public bindings!: InsightBindings;
  public foldedResultList!: InsightFoldedResultList;
  public resultsPerPage!: InsightResultsPerPage;
  private itemRenderingFunction: ItemRenderingFunction;
  private loadingFlag = randomID('firstResultLoaded-');
  private itemTemplateProvider!: ResultTemplateProvider;
  private nextNewResultTarget?: FocusTargetController;
  private display: ItemDisplayLayout = 'list';
  private itemListCommon!: ItemListCommon;

  @Element() public host!: HTMLDivElement;

  @BindStateToController('foldedResultList')
  @State()
  public foldedResultListState!: InsightFoldedResultListState;
  @BindStateToController('resultsPerPage')
  @State()
  public resultsPerPageState!: InsightResultsPerPageState;
  @State() private resultTemplateRegistered = false;
  @State() public error!: Error;
  @State() private isAppLoaded = false;
  @State() private templateHasError = false;

  /**
   * The spacing of various elements in the result list, including the gap between results, the gap between parts of a result, and the font sizes of different parts in a result.
   */
  @Prop({reflect: true}) density: ItemDisplayDensity = 'normal';
  /**
   * The expected size of the image displayed in the results.
   */
  @Prop({reflect: true}) imageSize: ItemDisplayImageSize = 'icon';
  /**
   * The name of the field on which to do the folding. The folded result list component will use the values of this field to resolve the collections of result items.
   *
   * @defaultValue `foldingcollection`
   */
  @Prop({reflect: true}) public collectionField?: string;
  /**
   * The name of the field that determines whether a certain result is a top result containing other child results within a collection.
   *
   * @defaultValue `foldingparent`
   */
  @Prop({reflect: true}) public parentField?: string;
  /**
   * The name of the field that uniquely identifies a result within a collection.
   *
   * @defaultValue `foldingchild`
   */
  @Prop({reflect: true}) public childField?: string;

  /**
   * Sets a rendering function to bypass the standard HTML template mechanism for rendering results.
   * You can use this function while working with web frameworks that don't use plain HTML syntax such as React, Angular, or Vue.
   *
   * Do not use this method if you integrate Atomic in a plain HTML deployment.
   */
  @Method() public async setRenderFunction(
    resultRenderingFunction: ItemRenderingFunction
  ) {
    this.itemRenderingFunction = resultRenderingFunction;
  }

  @Listen('atomic/resolveFoldedResultList')
  resolveFoldedResultList(event: FoldedItemListStateContextEvent) {
    event.preventDefault();
    event.stopPropagation();
    event.detail(this.foldedResultList);
  }

  @Listen('atomic/loadCollection')
  loadCollection(event: CustomEvent<InsightFoldedCollection>) {
    event.preventDefault();
    event.stopPropagation();
    this.foldedResultList.loadCollection(event.detail);
  }

  public initialize() {
    try {
      this.foldedResultList = this.initFolding();
      this.resultsPerPage = buildInsightResultsPerPage(this.bindings.engine);
    } catch (e) {
      this.error = e as Error;
    }

    this.itemTemplateProvider = new ResultTemplateProvider({
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
      getCurrentNumberOfItems: () => this.foldedResultListState.results.length,
      getIsLoading: () => this.foldedResultListState.isLoading,
      host: this.host,
      loadingFlag: this.loadingFlag,
      nextNewItemTarget: this.focusTarget,
      store: this.bindings.store,
    });
    createAppLoadedListener(this.bindings.store, (isAppLoaded) => {
      this.isAppLoaded = isAppLoaded;
    });
  }

  private get focusTarget(): FocusTargetController {
    if (!this.nextNewResultTarget) {
      this.nextNewResultTarget = new FocusTargetController(this);
    }
    return this.nextNewResultTarget;
  }

  private initFolding(props = {options: {}}): InsightFoldedResultList {
    return buildInsightFoldedResultList(this.bindings.engine, {
      options: {
        ...props.options,
        folding: {
          collectionField: this.collectionField,
          parentField: this.parentField,
          childField: this.childField,
        },
      },
    });
  }

  public render() {
    this.itemListCommon.updateBreakpoints();
    const listClasses = this.computeListDisplayClasses();

    return (
      <ItemListGuard
        firstRequestExecuted={this.foldedResultListState.firstSearchExecuted}
        hasItems={this.foldedResultListState.hasResults}
        hasTemplate={this.resultTemplateRegistered}
        templateHasError={this.itemTemplateProvider.hasError}
        hasError={this.foldedResultListState.hasError}
      >
        <DisplayWrapper listClasses={listClasses} display={this.display}>
          <ResultsPlaceholdersGuard
            displayPlaceholders={!this.isAppLoaded}
            numberOfPlaceholders={this.resultsPerPageState.numberOfResults}
            display={this.display}
            density={this.density}
            imageSize={this.imageSize}
          ></ResultsPlaceholdersGuard>
          <ItemDisplayGuard
            firstRequestExecuted={
              this.foldedResultListState.firstSearchExecuted
            }
            hasItems={this.foldedResultListState.hasResults}
          >
            {this.foldedResultListState.results.map((collection, i) => {
              const atomicInsightResultProps =
                this.getPropsForAtomicInsightResult(collection);
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
    const displayPlaceholders = !this.isAppLoaded;

    return getItemListDisplayClasses(
      this.display,
      this.density,
      this.imageSize,
      this.foldedResultListState.firstSearchExecuted &&
        this.foldedResultListState.isLoading,
      displayPlaceholders
    );
  }

  private getPropsForAtomicInsightResult(collection: InsightFoldedCollection) {
    const result = extractUnfoldedItem(collection);

    return {
      interactiveResult: buildInsightInteractiveResult(this.bindings.engine, {
        options: {result},
      }),
      result,
      renderingFunction: this.itemRenderingFunction,
      loadingFlag: this.loadingFlag,
      key: this.itemListCommon.getResultId(
        result.uniqueId,
        this.foldedResultListState.searchResponseId,
        this.density,
        this.imageSize
      ),
      content: this.itemTemplateProvider.getTemplateContent(result),
      store: this.bindings.store,
      density: this.density,
      display: this.display,
      imageSize: this.imageSize,
    };
  }
}
