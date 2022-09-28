import {Component, h, Element, State, Prop, Host} from '@stencil/core';

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
import {
  insightBuildResultTemplatesManager,
  InsightResultList,
  InsightResultListState,
  InsightResult,
  InsightResultTemplate,
  InsightResultTemplatesManager,
  buildInsightResultList,
} from '..';
import {randomID} from '../../../utils/utils';
import {ListDisplayResultsPlaceholder} from '../../common/atomic-result-placeholder/placeholders';
import {
  buildResultsPerPage,
  ResultsPerPage,
  ResultsPerPageState,
} from '@coveo/headless/insight';

export type TemplateContent = DocumentFragment;

interface TemplateElement extends HTMLElement {
  getTemplate(): Promise<InsightResultTemplate<DocumentFragment> | null>;
}

/**
 * @internal
 */
@Component({
  tag: 'atomic-insight-result-list',
  styleUrl: 'atomic-insight-result-list.pcss',
  shadow: true,
})
export class AtomicInsightResultList {
  @InitializeBindings() public bindings!: InsightBindings;
  public resultList!: InsightResultList;
  public resultsPerPage!: ResultsPerPage;
  private resultTemplatesManager!: InsightResultTemplatesManager<TemplateContent>;
  @State() public ready = false;
  @Element() public host!: HTMLDivElement;

  @BindStateToController('resultsPerPage')
  @State()
  public resultPerPageState!: ResultsPerPageState;

  @State() public templateHasError = false;

  @BindStateToController('resultList')
  @State()
  public resultListState!: InsightResultListState;

  @State() public error!: Error;

  private loadingFlag = randomID('firstInsightResultLoaded-');

  /**
   * The spacing of various elements in the result list, including the gap between results, the gap between parts of a result, and the font sizes of different parts in a result.
   */
  @Prop({reflect: true}) density: ResultDisplayDensity = 'normal';
  /**
   * The expected size of the image displayed in the results.
   */
  @Prop({reflect: true}) imageSize: ResultDisplayImageSize = 'icon';

  public async initialize() {
    this.resultList = buildInsightResultList(this.bindings.engine, {
      options: {
        fieldsToInclude: this.bindings.store.state.fieldsToInclude || undefined,
      },
    });
    this.registerResultTemplates();
    this.bindings.store.setLoadingFlag(this.loadingFlag);
    this.resultsPerPage = buildResultsPerPage(this.bindings.engine);
    // TODO:
    // this.bindings.store.registerResultList(this);
  }

  public getTemplate(result: InsightResult) {
    return this.resultTemplatesManager.selectTemplate(result);
  }

  private async registerResultTemplates() {
    this.resultTemplatesManager = insightBuildResultTemplatesManager(
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
      ) as InsightResultTemplate<DocumentFragment>[]
    );

    this.resultTemplatesManager.registerTemplates(...templates);
    this.ready = true;
  }

  private makeDefaultTemplate(): InsightResultTemplate<DocumentFragment> {
    const content = document.createDocumentFragment();
    const linkEl = document.createElement('atomic-result-link');
    content.appendChild(linkEl);
    return {
      content,
      conditions: [],
    };
  }

  private getContentOfResultTemplate(
    result: InsightResult
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
    if (this.resultListState.hasError) {
      return null;
    }
    if (
      this.resultListState.firstSearchExecuted &&
      !this.resultListState.hasResults
    ) {
      return;
    }
    return (
      <Host>
        {this.templateHasError && <slot></slot>}
        <div class={`list-wrapper ${this.getClasses()}`}>
          <div class={`list-root  ${this.getClasses()}`} part="result-list">
            {!this.bindings.store.isAppLoaded() && (
              <ListDisplayResultsPlaceholder
                numberOfPlaceholders={this.resultPerPageState.numberOfResults}
                display="list"
                density={this.density}
                imageSize={this.imageSize}
              />
            )}
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
                  loadingFlag={this.loadingFlag}
                />
              ))}
          </div>
        </div>
      </Host>
    );
  }
}
