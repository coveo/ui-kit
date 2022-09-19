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
  FoldedCollection,
} from '@coveo/headless';
import {
  BindStateToController,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {
  ResultDisplayDensity,
  ResultDisplayImageSize,
} from '../../../common/layout/display-options';
import {
  BaseResultList,
  ResultListCommon,
  ResultRenderingFunction,
} from '../result-list-common';
import {FoldedResultListStateContextEvent} from '../result-list-decorators';
import {randomID} from '../../../../utils/utils';
import {
  FocusTarget,
  FocusTargetController,
} from '../../../../utils/accessibility-utils';
import {ResultListInfo} from '../../atomic-search-interface/store';
import {Bindings} from '../../atomic-search-interface/atomic-search-interface';

/**
 * The `atomic-folded-result-list` component is responsible for displaying folded query results, by applying one or more result templates for up to three layers (i.e., to the result, child and grandchild).
 *
 * @part result-list - The element containing every result of a result list
 * @part outline - The element displaying an outline or a divider around a result
 */
@Component({
  tag: 'atomic-folded-result-list',
  styleUrl: '../../../common/result-list/result-list.pcss',
  shadow: true,
})
export class AtomicFoldedResultList implements BaseResultList, ResultListInfo {
  @InitializeBindings() public bindings!: Bindings;
  public foldedResultList!: FoldedResultList;
  public resultsPerPage!: ResultsPerPage;
  public listWrapperRef?: HTMLDivElement;

  @Element() public host!: HTMLDivElement;

  @BindStateToController('foldedResultList')
  @State()
  public foldedResultListState!: FoldedResultListState;

  @BindStateToController('resultsPerPage')
  @State()
  public resultsPerPageState!: ResultsPerPageState;

  @State() public ready = false;

  @State() public error!: Error;
  @State() public templateHasError = false;

  @FocusTarget() nextNewResultTarget!: FocusTargetController;

  public resultListCommon!: ResultListCommon;
  private renderingFunction: ResultRenderingFunction | null = null;
  private loadingFlag = randomID('firstResultLoaded-');

  /**
   * Whether to automatically retrieve an additional page of results and append it to the
   * current results when the user scrolls down to the bottom of element
   */
  private enableInfiniteScroll = false;

  /**
   * A list of non-default fields to include in the query results, separated by commas.
   * @deprecated add it to atomic-search-interface instead
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
  @Method() public async setRenderFunction(render: ResultRenderingFunction) {
    this.renderingFunction = render;
    this.assignRenderingFunctionIfPossible();
  }

  /**
   * @internal
   */
  @Method() public async focusOnNextNewResult() {
    this.resultListCommon.focusOnNextNewResult(this.foldedResultListState);
  }

  @Listen('scroll', {target: 'window'})
  handleInfiniteScroll() {
    if (
      this.enableInfiniteScroll &&
      this.resultListCommon.scrollHasReachedEndOfList
    ) {
      this.foldedResultList.fetchMoreResults();
    }
  }

  @Listen('atomic/resolveFoldedResultList')
  resolveFoldedResultList(event: FoldedResultListStateContextEvent) {
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

  public async initialize() {
    this.resultListCommon = new ResultListCommon({
      host: this.host,
      bindings: this.bindings,
      templateElements: this.host.querySelectorAll('atomic-result-template'),
      onReady: () => {
        this.ready = true;
        this.assignRenderingFunctionIfPossible();
      },
      onError: () => {
        this.templateHasError = true;
      },
      loadingFlag: this.loadingFlag,
      nextNewResultTarget: this.nextNewResultTarget,
    });

    try {
      const localFieldsToInclude = this.fieldsToInclude
        ? this.fieldsToInclude.split(',').map((field) => field.trim())
        : [];
      const fieldsToInclude = localFieldsToInclude.concat(
        this.bindings.store.state.fieldsToInclude
      );

      this.foldedResultList = this.initFolding({options: {fieldsToInclude}});
      this.resultsPerPage = buildResultsPerPage(this.bindings.engine);
    } catch (e) {
      this.error = e as Error;
    }

    this.bindings.store.registerResultList(this);
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

  public render() {
    return this.resultListCommon.renderList({
      host: this.host,
      density: this.density,
      imageSize: this.imageSize,
      templateHasError: this.templateHasError,
      resultListState: this.foldedResultListState,
      resultsPerPageState: this.resultsPerPageState,
      setListWrapperRef: (el) => {
        this.listWrapperRef = el as HTMLDivElement;
      },
      getContentOfResultTemplate: this.getContentOfResultTemplate,
      ready: this.ready,
    });
  }

  private assignRenderingFunctionIfPossible() {
    if (this.resultListCommon && this.renderingFunction) {
      this.resultListCommon.renderingFunction = this
        .renderingFunction as ResultRenderingFunction;
    }
  }
}
