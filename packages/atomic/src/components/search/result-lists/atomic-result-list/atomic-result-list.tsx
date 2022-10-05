import {Component, Element, State, Prop, Method, h} from '@stencil/core';
import {
  ResultList,
  ResultListState,
  buildResultList,
  ResultsPerPageState,
  ResultsPerPage,
  buildResultsPerPage,
} from '@coveo/headless';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {randomID} from '../../../../utils/utils';
import {
  FocusTarget,
  FocusTargetController,
} from '../../../../utils/accessibility-utils';
import {Bindings} from '../../atomic-search-interface/atomic-search-interface';
import {
  ResultDisplayDensity,
  ResultDisplayImageSize,
  ResultDisplayLayout,
} from '../../../common/layout/display-options';
import {ResultListCommon} from '../../../common/result-list/result-list-common';
import {ResultRenderingFunction} from '../../../common/result-list/result-list-common-interface';
import {ResultTemplateProvider} from '../../../common/result-list/result-template-provider';

/**
 * The `atomic-result-list` component is responsible for displaying query results by applying one or more result templates.
 *
 * @part result-list - The element containing every result of a result list
 * @part outline - The element displaying an outline or a divider around a result
 * @part result-list-grid-clickable-container - The parent of the result & the clickable link encompassing it, when results are displayed as a grid
 * @part result-list-grid-clickable - The clickable link encompassing the result when results are displayed as a grid
 * @part result-table - The element of the result table containing a heading and a body
 * @part result-table-heading - The element containing the row of cells in the result table's heading
 * @part result-table-heading-row - The element containing cells of the result table's heading
 * @part result-table-heading-cell - The element representing a cell of the result table's heading
 * @part result-table-body - The element containing the rows of the result table's body
 * @part result-table-row - The element containing the cells of a row in the result table's body
 * @part result-table-row-odd - The element containing the cells of an odd row in the result table's body
 * @part result-table-row-even - The element containing the cells of an even row in the result table's body
 * @part result-table-cell - The element representing a cell of the result table's body
 */
@Component({
  tag: 'atomic-result-list',
  styleUrl: 'atomic-result-list.pcss',
  shadow: true,
})
export class AtomicResultList implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  public resultList!: ResultList;
  public resultsPerPage!: ResultsPerPage;
  private resultListCommon!: ResultListCommon;
  private loadingFlag = randomID('firstResultLoaded-');
  private resultRenderingFunction: ResultRenderingFunction;

  @Element() public host!: HTMLDivElement;

  @BindStateToController('resultList')
  @State()
  private resultListState!: ResultListState;
  @BindStateToController('resultsPerPage')
  @State()
  private resultsPerPageState!: ResultsPerPageState;
  @State() private resultTemplateRegistered = false;
  @State() public error!: Error;
  @State() private templateHasError = false;

  @FocusTarget() nextNewResultTarget!: FocusTargetController;

  /**
   * A list of non-default fields to include in the query results, separated by commas.
   * @deprecated add it to atomic-search-interface instead
   */
  @Prop({reflect: true}) public fieldsToInclude = '';
  /**
   * The desired layout to use when displaying results. Layouts affect how many results to display per row and how visually distinct they are from each other.
   */
  @Prop({reflect: true}) public display: ResultDisplayLayout = 'list';
  /**
   * The spacing of various elements in the result list, including the gap between results, the gap between parts of a result, and the font sizes of different parts in a result.
   */
  @Prop({reflect: true}) public density: ResultDisplayDensity = 'normal';
  /**
   * The expected size of the image displayed in the results.
   */
  @Prop({reflect: true, mutable: true})
  public imageSize: ResultDisplayImageSize = 'icon';
  /**
   * @deprecated use `imageSize` instead.
   */
  @Prop({reflect: true}) public image: ResultDisplayImageSize = 'icon';

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

  public connectedCallback() {
    this.settleImageSize();
  }

  // TODO: remove v2 when `image` prop is removed;
  private settleImageSize() {
    if (this.host.hasAttribute('image-size')) {
      return;
    }
    if (this.host.hasAttribute('image')) {
      this.imageSize = this.image;
    }
  }

  public initialize() {
    if (this.host.innerHTML.includes('<atomic-result-children')) {
      console.warn(
        'Folded results will not render any children for the "atomic-result-list". Please use "atomic-folded-result-list" instead.'
      );
    }
    this.bindings.store.addFieldsToInclude(
      this.fieldsToInclude
        ? this.fieldsToInclude.split(',').map((field) => field.trim())
        : []
    );
    this.resultList = buildResultList(this.bindings.engine);
    this.resultsPerPage = buildResultsPerPage(this.bindings.engine);
    const resultTemplateProvider = new ResultTemplateProvider({
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

    this.resultListCommon = new ResultListCommon({
      resultTemplateProvider,
      getNumberOfPlaceholders: () => this.resultsPerPageState.numberOfResults,
      host: this.host,
      bindings: this.bindings,
      getDensity: () => this.density,
      getDisplay: () => this.display,
      getImageSize: () => this.imageSize,
      nextNewResultTarget: this.nextNewResultTarget,
      loadingFlag: this.loadingFlag,
      getResultListState: () => this.resultListState,
      getResultRenderingFunction: () => this.resultRenderingFunction,
      renderResult: (props) => <atomic-result {...props}></atomic-result>,
    });
  }

  public render() {
    return this.resultListCommon.render();
  }
}
