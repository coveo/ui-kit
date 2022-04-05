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
} from '../../utils/initialization-utils';
import {
  ResultDisplayDensity,
  ResultDisplayImageSize,
} from '../atomic-result/atomic-result-display-options';
import {
  ResultListCommon,
  ResultRenderingFunction,
  AtomicResultListBase,
} from '../result-lists/result-list-common';

/**
 * The `atomic-folded-result-list` component is responsible for displaying query results by applying one or more result templates.
 *
 * @internal
 * @part result-list - The element containing every result of a result list
 */
@Component({
  tag: 'atomic-folded-result-list',
  styleUrl: 'atomic-folded-result-list.pcss',
  shadow: true,
})
export class AtomicFoldedResultList
  implements InitializableComponent, AtomicResultListBase
{
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
   * TODO: KIT-452 Infinite scroll feature
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
   * TODO:
   */
  @Prop({reflect: true}) public collectionField?: string;
  /**
   * TODO:
   */
  @Prop({reflect: true}) public parentField?: string;
  /**
   * TODO:
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
    this.resultListCommon.handleInfiniteScroll(
      this.enableInfiniteScroll,
      this.host,
      this.resultList
    );
  }

  public async initialize() {
    this.resultListCommon = new ResultListCommon({
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
      this.resultListState,
      this.listWrapperRef
    );
  }

  public render() {
    return this.resultListCommon.renderList(this);
  }
}
