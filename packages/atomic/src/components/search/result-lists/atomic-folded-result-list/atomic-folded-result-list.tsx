import {
  ResultsPerPageState,
  ResultsPerPage,
  buildFoldedResultList,
  FoldedResultList,
  FoldedResultListState,
  buildResultsPerPage,
  ResultListProps,
  FoldedCollection,
  Result,
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
import {
  ResultDisplayDensity,
  ResultDisplayImageSize,
  ResultDisplayLayout,
} from '../../../common/layout/display-options';
import {ResultListCommon} from '../../../common/result-list/result-list-common';
import {ResultRenderingFunction} from '../../../common/result-list/result-list-common-interface';
import {FoldedResultListStateContextEvent} from '../../../common/result-list/result-list-decorators';
import {ResultTemplateProvider} from '../../../common/result-list/result-template-provider';
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
  private resultListCommon!: ResultListCommon;
  private resultRenderingFunction: ResultRenderingFunction;
  private loadingFlag = randomID('firstResultLoaded-');
  private display: ResultDisplayLayout = 'list';

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

  private nextNewResultTarget?: FocusTargetController;

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
   * The number of child results to fold under the root collection element, before expansion.
   *
   * @defaultValue `2`
   *
   * @example For an email thread with a total of 20 messages, using the default value of `2` will display the first two messages.
   * The user can then click to expand the collection and see the remaining 18 messages, see the `atomic-load-more-children-results` component.
   */
  @Prop({reflect: true}) public numberOfFoldedResults = 2;

  /**
   * Sets a rendering function to bypass the standard HTML template mechanism for rendering results.
   * You can use this function while working with web frameworks that don't use plain HTML syntax, e.g., React, Angular or Vue.
   *
   * Do not use this method if you integrate Atomic in a plain HTML deployment.
   */
  @Method() public async setRenderFunction(
    resultRenderingFunction: ResultRenderingFunction
  ) {
    this.resultRenderingFunction = resultRenderingFunction;
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

  private get focusTarget() {
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
      getResultDisplay: () => this.display,
      getLayoutDisplay: () => this.display,
      getImageSize: () => this.imageSize,
      nextNewResultTarget: this.focusTarget,
      loadingFlag: this.loadingFlag,
      getResultListState: () => this.foldedResultListState,
      getResultRenderingFunction: () => this.resultRenderingFunction,
      renderResult: (props) => <atomic-result {...props}></atomic-result>,
      getInteractiveResult: (result: Result) =>
        buildInteractiveResult(this.bindings.engine, {
          options: {result},
        }),
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
    return this.resultListCommon.render();
  }
}
