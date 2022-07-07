import {Component, h, Element, State, Prop, Host} from '@stencil/core';
import {
  buildInsightResultList,
  InsightResultList,
  InsightResultListState,
  Result,
  ResultTemplate,
  ResultTemplatesManager,
  buildResultTemplatesManager,
} from '@coveo/headless/insight';
import {InsightBindings} from '../atomic-insight-interface/atomic-insight-interface';
import {
  BindStateToController,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {
  getResultDisplayClasses,
  ResultDisplayDensity,
  ResultDisplayImageSize,
} from '../../common/layout/display-options';

export type TemplateContent = DocumentFragment;

interface TemplateElement extends HTMLElement {
  getTemplate(): Promise<ResultTemplate<DocumentFragment> | null>;
}

/**
 * The `atomic-insight-result-list` component is responsible for displaying query results by applying one or more insight result templates.
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
  tag: 'atomic-insight-result-list',
  // TODO:
  styleUrl: 'atomic-insight-result-list.pcss',
  shadow: true,
})
export class AtomicInsightResultList {
  @InitializeBindings() public bindings!: InsightBindings;
  public resultList!: InsightResultList;
  private resultTemplatesManager!: ResultTemplatesManager<TemplateContent>;
  @State() public ready = false;
  @Element() public host!: HTMLDivElement;
  // TODO:
  // public resultsPerPage!: ResultsPerPage;
  // public listWrapperRef?: HTMLDivElement;

  @State() public templateHasError = false;

  @BindStateToController('resultList')
  @State()
  public resultListState!: InsightResultListState;

  // TODO:
  // @BindStateToController('resultsPerPage')
  // @State()
  // public resultsPerPageState!: ResultsPerPageState;

  @State() public error!: Error;

  // TODO:
  // @FocusTarget() nextNewResultTarget!: FocusTargetController;

  // TODO:
  // private loadingFlag = randomID('firstResultLoaded-');

  /**
   * The spacing of various elements in the result list, including the gap between results, the gap between parts of a result, and the font sizes of different parts in a result.
   */
  @Prop({reflect: true}) density: ResultDisplayDensity = 'normal';
  /**
   * The expected size of the image displayed in the results.
   */
  @Prop({reflect: true}) imageSize: ResultDisplayImageSize = 'icon';

  // TODO:
  // /**
  //  * @internal
  //  */
  // @Method() public async focusOnNextNewResult() {
  //   this.resultListCommon.focusOnNextNewResult(this.resultListState);
  // }

  public async initialize() {
    this.resultList = buildInsightResultList(this.bindings.engine, {
      options: {
        fieldsToInclude: this.bindings.store.state.fieldsToInclude || undefined,
      },
    });
    this.registerResultTemplates();
    // TODO:
    // this.resultsPerPage = buildResultsPerPage(this.bindings.engine);
    // this.bindings.store.registerResultList(this);
  }

  public getTemplate(result: Result) {
    return this.resultTemplatesManager.selectTemplate(result);
  }

  private async registerResultTemplates() {
    this.resultTemplatesManager = buildResultTemplatesManager(
      this.bindings.engine
    );
    const elements = this.host.querySelectorAll(
      'atomic-insight-result-template'
    ) as NodeListOf<TemplateElement>;
    const customTemplates = await Promise.all(
      Array.from(elements).map(async (resultTemplateElement) => {
        const template = await resultTemplateElement.getTemplate();
        if (!template) {
          this.templateHasError = true;
        }
        return template;
      })
    );

    const templates = [this.makeDefaultTemplate()].concat(
      customTemplates.filter(
        (template) => template
      ) as ResultTemplate<DocumentFragment>[]
    );

    this.resultTemplatesManager.registerTemplates(...templates);
    this.ready = true;
  }

  private makeDefaultTemplate(): ResultTemplate<DocumentFragment> {
    const content = document.createDocumentFragment();
    const linkEl = document.createElement('atomic-result-link');
    content.appendChild(linkEl);
    return {
      content,
      conditions: [],
    };
  }

  private getContentOfResultTemplate(
    result: Result
  ): HTMLElement | DocumentFragment {
    return this.getTemplate(result)!;
  }
  private getClasses(): string {
    const classes = getResultDisplayClasses(
      'list',
      this.density,
      this.imageSize
    );
    if (
      this.resultListState.firstSearchExecuted &&
      this.resultListState.isLoading
    ) {
      classes.push('loading');
    }
    if (!this.bindings.store.isAppLoaded()) {
      classes.push('placeholder');
    }
    return classes.join(' ');
  }

  render() {
    if (!this.ready) {
      return null;
    }
    return (
      <Host>
        {this.templateHasError && <slot></slot>}
        <div class={`list-wrapper ${this.getClasses()}`}>
          <div class={`list-root  ${this.getClasses()}`} part="result-list">
            {/* TODO: when results per page state is ready in headless*/}
            {/* {this.bindings.store.isAppLoaded() && (
              <ListDisplayResultsPlaceholder
                display="list"
                density={this.density}
                imageSize={this.imageSize}
                // resultsPerPageState={this.resultsPerPageState}
              />
            )} */}
            {this.resultListState.firstSearchExecuted &&
              this.resultListState.results.map((result) => (
                <atomic-insight-result
                  key={result.uniqueId}
                  part="divider"
                  result={result}
                  store={this.bindings.store}
                  engine={this.bindings.engine}
                  density={this.density}
                  imageSize={this.imageSize}
                  content={this.getContentOfResultTemplate(result)}
                  classes={this.getClasses()}
                  // TODO:
                  // indexOfResultToFocus={this.indexOfResultToFocus}
                  // newResultRef={(element) =>
                  //   this.onFirstNewResultRendered(element)
                  // }
                  // loadingFlag={this.}
                  // ref={(element) =>
                  //   element &&
                  //   props.indexOfResultToFocus === index &&
                  //   props.newResultRef?.(element)
                  // }
                />
              ))}
          </div>
        </div>
      </Host>
    );
  }
}
