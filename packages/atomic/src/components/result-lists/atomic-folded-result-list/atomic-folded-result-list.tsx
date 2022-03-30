import {
  Component,
  h,
  Element,
  State,
  Prop,
  Listen,
  Method,
} from '@stencil/core';
import {
  ResultTemplatesManager,
  ResultsPerPageState,
  ResultsPerPage,
  buildFoldedResultList,
  FoldedResultList,
  FoldedResult,
  FoldedResultListState,
  FoldedResultListProps,
  SearchEngine,
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
import {TemplateContent} from '../../result-template/atomic-result-template/atomic-result-template';
import {ResultList} from '../result-list';
import {
  getTemplate,
  handleInfiniteScroll,
  initializeResultList,
  postRenderCleanUp,
} from '../result-list-common';

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
export class AtomicFoldedResultList implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  public resultList!: FoldedResultList;
  public resultsPerPage!: ResultsPerPage;
  public resultTemplatesManager!: ResultTemplatesManager<TemplateContent>;
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

  /**
   * TODO: KIT-452 Infinite scroll feature
   * Whether to automatically retrieve an additional page of results and append it to the
   * current results when the user scrolls down to the bottom of element
   */
  private enableInfiniteScroll = false;
  private renderingFunction?: (result: FoldedResult) => HTMLElement = undefined;

  /**
   * A list of non-default fields to include in the query results, separated by commas.
   * The default fields sent in a request are: 'date', 'author', 'source', 'language', 'filetype', 'parents', ‘urihash’, ‘objecttype’, ‘collection’, ‘permanentid’ 'ec_price', 'ec_name', 'ec_description', 'ec_brand', 'ec_category', 'ec_item_group_id', 'ec_shortdesc', 'ec_thumbnails', 'ec_images', 'ec_promo_price', 'ec_in_stock', 'ec_cogs', and 'ec_rating'.
   */
  @Prop({reflect: true}) public fieldsToInclude = '';
  /**
   * The spacing of various elements in the result list, including the gap between results, the gap between parts of a result, and the font sizes of different parts in a result.
   */
  @Prop({reflect: true}) density: ResultDisplayDensity = 'normal';
  /**
   * The expected size of the image displayed in the results.
   */
  @Prop({reflect: true}) imageSize?: ResultDisplayImageSize;
  /**
   * @deprecated use `imageSize` instead.
   */
  @Prop({reflect: true}) image: ResultDisplayImageSize = 'icon';
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
    this.renderingFunction = render;
  }

  @Listen('scroll', {target: 'window'})
  handleInfiniteScroll() {
    handleInfiniteScroll(this.enableInfiniteScroll, this.host, this.resultList);
  }

  public async initialize() {
    await initializeResultList.call(this, this.initFolding.bind(this));
  }

  private initFolding(_: SearchEngine<{}>, options: FoldedResultListProps) {
    const opts = {...options};

    if (!opts.options) {
      opts.options = {};
    }
    opts.options.folding = {};
    if (this.collectionField) {
      opts.options.folding.collectionField = this.collectionField;
    }
    if (this.parentField) {
      opts.options.folding.parentField = this.parentField;
    }
    if (this.childField) {
      opts.options.folding.childField = this.childField;
    }

    return buildFoldedResultList(this.bindings.engine, opts);
  }

  public getContentOfResultTemplate(
    foldedResult: FoldedResult
  ): HTMLElement | DocumentFragment {
    return this.renderingFunction
      ? this.renderingFunction(foldedResult)
      : getTemplate(this.resultTemplatesManager, foldedResult.result)!;
  }

  public componentDidRender() {
    postRenderCleanUp.call(this);
  }

  public render() {
    return <ResultList parent={this} />;
  }
}
