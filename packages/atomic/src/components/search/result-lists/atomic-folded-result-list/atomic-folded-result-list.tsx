import {
  ResultsPerPageState,
  ResultsPerPage,
  buildFoldedResultList,
  FoldedResultList,
  FoldedResultListState,
  buildResultsPerPage,
  ResultListProps,
  FoldedCollection,
  buildInteractiveResult,
} from '@coveo/headless';
import {
  Component,
  Element,
  State,
  Prop,
  Listen,
  Method,
  h,
} from '@stencil/core';
import {FocusTargetController} from '../../../../utils/accessibility-utils';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {randomID} from '../../../../utils/utils';
import {ResultsPlaceholdersGuard} from '../../../common/atomic-result-placeholder/placeholders';
import {extractUnfoldedItem} from '../../../common/interface/item';
import {DisplayWrapper} from '../../../common/item-list/display-wrapper';
import {ItemDisplayGuard} from '../../../common/item-list/item-display-guard';
import {
  ItemListCommon,
  ItemRenderingFunction,
} from '../../../common/item-list/item-list-common';
import {FoldedItemListStateContextEvent} from '../../../common/item-list/item-list-decorators';
import {ItemListGuard} from '../../../common/item-list/item-list-guard';
import {ItemTemplateProvider} from '../../../common/item-list/item-template-provider';
import {
  ItemDisplayDensity,
  ItemDisplayImageSize,
  ItemDisplayLayout,
  getItemListDisplayClasses,
} from '../../../common/layout/display-options';
import {Bindings} from '../../atomic-search-interface/atomic-search-interface';

/**
 * The `atomic-folded-result-list` component is responsible for displaying folded query results, by applying one or more result templates for up to three layers (i.e., to the result, child and grandchild).
 *
 * @part result-list - The element containing every result of a result list
 * @part outline - The element displaying an outline or a divider around a result
 */
@Component({
  tag: 'atomic-folded-result-list',
  styleUrl: 'atomic-folded-result-list.pcss',
  shadow: true,
})
export class AtomicFoldedResultList implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  public foldedResultList!: FoldedResultList;
  public resultsPerPage!: ResultsPerPage;
  private resultRenderingFunction: ItemRenderingFunction;
  private loadingFlag = randomID('firstResultLoaded-');
  private itemTemplateProvider!: ItemTemplateProvider;
  private nextNewResultTarget?: FocusTargetController;
  private itemListCommon!: ItemListCommon;
  private display: ItemDisplayLayout = 'list';

  @Element() public host!: HTMLDivElement;

  @BindStateToController('foldedResultList')
  @State()
  public foldedResultListState!: FoldedResultListState;
  @BindStateToController('resultsPerPage')
  @State()
  public resultsPerPageState!: ResultsPerPageState;
  @State() private resultTemplateRegistered = false;
  @State() public error!: Error;
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
   * The initial number of child results to request for each folded collection, before expansion.
   *
   * @defaultValue `2`
   *
   * @example For an email thread with a total of 20 messages, using the default value of `2` will request the top two child messages, based on the current sort criteria and query, to be returned as children of the parent message.
   * The user can then click to expand the collection and see the remaining messages that match the current query (i.e., not necessarily all remaining 18 messages). Those messages will be sorted based on the current sort criteria (i.e., not necessarily by date). See the `atomic-load-more-children-results` component.
   * For more info on Result Folding, see [Result Folding](https://docs.coveo.com/en/1884).
   **/
  @Prop({reflect: true}) public numberOfFoldedResults = 2;

  /**
   * Sets a rendering function to bypass the standard HTML template mechanism for rendering results.
   * You can use this function while working with web frameworks that don't use plain HTML syntax, e.g., React, Angular or Vue.
   *
   * Do not use this method if you integrate Atomic in a plain HTML deployment.
   */
  @Method() public async setRenderFunction(
    resultRenderingFunction: ItemRenderingFunction
  ) {
    this.resultRenderingFunction = resultRenderingFunction;
  }

  @Listen('atomic/resolveFoldedResultList')
  resolveFoldedResultList(event: FoldedItemListStateContextEvent) {
    event.preventDefault();
    event.stopPropagation();
    event.detail(this.foldedResultList);
  }

  @Listen('atomic/loadCollection')
  loadCollection(event: CustomEvent<FoldedCollection>) {
    event.preventDefault();
    event.stopPropagation();
    this.foldedResultList.loadCollection(event.detail);
  }

  public get focusTarget() {
    if (!this.nextNewResultTarget) {
      this.nextNewResultTarget = new FocusTargetController(this);
    }
    return this.nextNewResultTarget;
  }

  public initialize() {
    try {
      this.foldedResultList = this.initFolding();
      this.resultsPerPage = buildResultsPerPage(this.bindings.engine);
    } catch (e) {
      this.error = e as Error;
    }

    this.itemTemplateProvider = new ItemTemplateProvider({
      includeDefaultTemplate: true,
      templateElements: Array.from(
        this.host.querySelectorAll('atomic-result-template')
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
  }

  private initFolding(
    props: ResultListProps = {options: {}}
  ): FoldedResultList {
    return buildFoldedResultList(this.bindings.engine, {
      options: {
        ...props.options,
        folding: {
          collectionField: this.collectionField,
          parentField: this.parentField,
          childField: this.childField,
          numberOfFoldedResults: this.numberOfFoldedResults,
        },
      },
    });
  }

  public render() {
    this.itemListCommon.updateBreakpoints();
    const listClasses = this.computeListDisplayClasses();

    return (
      <ItemListGuard
        hasError={this.foldedResultListState.hasError}
        firstRequestExecuted={this.foldedResultListState.firstSearchExecuted}
        hasItems={this.foldedResultListState.hasResults}
        hasTemplate={this.resultTemplateRegistered}
        templateHasError={this.itemTemplateProvider.hasError}
      >
        <DisplayWrapper listClasses={listClasses} display={this.display}>
          <ResultsPlaceholdersGuard
            density={this.density}
            imageSize={this.imageSize}
            display={this.display}
            displayPlaceholders={!this.bindings.store.isAppLoaded()}
            numberOfPlaceholders={this.resultsPerPageState.numberOfResults}
          ></ResultsPlaceholdersGuard>
          <ItemDisplayGuard
            firstRequestExecuted={
              this.foldedResultListState.firstSearchExecuted
            }
            hasItems={this.foldedResultListState.hasResults}
          >
            {this.foldedResultListState.results.map((collection, i) => {
              const propsForAtomicResult =
                this.getPropsForAtomicResult(collection);
              return (
                <atomic-result
                  {...propsForAtomicResult}
                  part="outline"
                  ref={(element) =>
                    element && this.itemListCommon.setNewResultRef(element, i)
                  }
                ></atomic-result>
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
      this.foldedResultListState.firstSearchExecuted &&
        this.foldedResultListState.isLoading,
      displayPlaceholders
    );
  }

  private getPropsForAtomicResult(collection: FoldedCollection) {
    const result = extractUnfoldedItem(collection);

    return {
      interactiveResult: buildInteractiveResult(this.bindings.engine, {
        options: {result},
      }),
      result,
      renderingFunction: this.resultRenderingFunction,
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
      imageSize: this.imageSize,
      display: this.display,
    };
  }
}
