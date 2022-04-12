import {Component, Element, State, Prop, Listen, Method} from '@stencil/core';
import {
  ResultsPerPageState,
  ResultsPerPage,
  buildFoldedResultList,
  FoldedResultList,
  FoldedResult,
  FoldedResultListState,
  buildResultsPerPage,
  ResultListProps,
} from '@coveo/headless';
import {
  Bindings,
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {
  ResultDisplayDensity,
  ResultDisplayImageSize,
} from '../../atomic-result/atomic-result-display-options';
import {ResultListCommon, ResultRenderingFunction} from '../result-list-common';

/**
 * The `atomic-folded-result-list` component is responsible for displaying folded query results, by applying one or more result templates for up to three layers (i.e., to the result, child and grandchild).
 *
 * @internal
 * @part result-list - The element containing every result of a result list
 */
@Component({
  tag: 'atomic-folded-result-list',
  styleUrl: '../result-list-common.pcss',
  shadow: true,
})
export class AtomicFoldedResultList implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  public resultList!: FoldedResultList;
  public resultsPerPage!: ResultsPerPage;
  public listWrapperRef?: HTMLDivElement;

  @Element() public host!: HTMLDivElement;

  @BindStateToController('resultList')
  @State()
  public resultListState!: FoldedResultListState;

  @BindStateToController('resultsPerPage')
  @State()
  public resultsPerPageState!: ResultsPerPageState;

  @State() public ready = false;

  @State() public error!: Error;
  @State() public templateHasError = false;

  public resultListCommon!: ResultListCommon;
  /**
   * Whether to automatically retrieve an additional page of results and append it to the
   * current results when the user scrolls down to the bottom of element
   */
  private enableInfiniteScroll = false;

  /**
   * A list of non-default fields to include in the query results, separated by commas.
   */
  @Prop({reflect: true}) public fieldsToInclude = '';
  /**
   * The spacing of various elements in the result list, including the gap between results, the gap between parts of a result, and the font sizes of different parts in a result.
   */
  @Prop({reflect: true}) density: ResultDisplayDensity = 'normal';
  /**
   * The expected size of the image displayed in the results.
   */
  @Prop({reflect: true}) imageSize: ResultDisplayImageSize = 'icon';
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
   * You can use this function while working with web frameworks that don't use plain HTML syntax, e.g., React, Angular or Vue.
   *
   * Do not use this method if you integrate Atomic in a plain HTML deployment.
   *
   * @param render
   */
  @Method() public async setRenderFunction(
    render: (result: FoldedResult) => HTMLElement
  ) {
    this.resultListCommon.renderingFunction = render as ResultRenderingFunction;
  }

  @Listen('scroll', {target: 'window'})
  handleInfiniteScroll() {
    if (
      this.enableInfiniteScroll &&
      this.resultListCommon.scrollHasReachedEndOfList
    ) {
      this.resultList.fetchMoreResults();
    }
  }

  public async initialize() {
    this.resultListCommon = new ResultListCommon({
      host: this.host,
      bindings: this.bindings,
      fieldsToInclude: this.fieldsToInclude,
      templateElements: this.host.querySelectorAll('atomic-result-template'),
      onReady: () => {
        this.ready = true;
      },
      onError: () => {
        this.templateHasError = true;
      },
    });

    this.resultList = this.initFolding(
      this.resultListCommon.resultListControllerProps
    );
    this.resultsPerPage = buildResultsPerPage(this.bindings.engine);
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
        },
      },
    });
  }

  public getContentOfResultTemplate(
    foldedResult: FoldedResult
  ): HTMLElement | DocumentFragment {
    return this.resultListCommon.getContentOfResultTemplate(foldedResult);
  }

  public componentDidRender() {
    this.resultListCommon.componentDidRender(
      this.resultListState.firstSearchExecuted,
      this.listWrapperRef
    );
  }

  public render() {
    return this.resultListCommon.renderList({
      host: this.host,
      density: this.density,
      imageSize: this.imageSize,
      templateHasError: this.templateHasError,
      resultListState: this.resultListState,
      resultsPerPageState: this.resultsPerPageState,
      setListWrapperRef: (el) => {
        this.listWrapperRef = el as HTMLDivElement;
      },
      getContentOfResultTemplate: this.getContentOfResultTemplate,
    });
  }
}
