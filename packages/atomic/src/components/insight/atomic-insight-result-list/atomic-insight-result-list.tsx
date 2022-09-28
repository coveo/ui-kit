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
  ResultDisplayLayout,
} from '../../common/layout/display-options';
import {
  InsightResultList,
  InsightResultListState,
  buildInsightResultList,
} from '..';
import {randomID} from '../../../utils/utils';
import {ListDisplayResultsPlaceholder} from '../../common/atomic-result-placeholder/placeholders';
import {
  buildResultsPerPage,
  ResultsPerPage,
  ResultsPerPageState,
} from '@coveo/headless/insight';
import {ResultTemplateProvider} from '../../common/result-list/result-template-provider';

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
  private resultTemplatesProvider!: ResultTemplateProvider;
  private loadingFlag = randomID('firstInsightResultLoaded-');
  private display: ResultDisplayLayout = 'list';

  @Element() public host!: HTMLDivElement;

  @BindStateToController('resultsPerPage')
  @State()
  public resultPerPageState!: ResultsPerPageState;
  @BindStateToController('resultList')
  @State()
  public resultListState!: InsightResultListState;
  @State() public templateHasError = false;
  @State() public resultTemplateRegistered = false;
  @State() public error!: Error;

  /**
   * The spacing of various elements in the result list, including the gap between results, the gap between parts of a result, and the font sizes of different parts in a result.
   */
  @Prop({reflect: true}) density: ResultDisplayDensity = 'normal';
  /**
   * The expected size of the image displayed in the results.
   */
  @Prop({reflect: true}) imageSize: ResultDisplayImageSize = 'icon';

  public initialize() {
    this.resultList = buildInsightResultList(this.bindings.engine, {
      options: {
        fieldsToInclude: this.bindings.store.state.fieldsToInclude || undefined,
      },
    });
    this.resultsPerPage = buildResultsPerPage(this.bindings.engine);

    this.resultTemplatesProvider = new ResultTemplateProvider({
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

    this.bindings.store.setLoadingFlag(this.loadingFlag);
    // TODO: this.bindings.store.registerResultList(this);
  }

  private getClasses(): string {
    const classes = getResultDisplayClasses(
      this.display,
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
    if (!this.resultTemplateRegistered) {
      return;
    }

    if (this.resultListState.hasError) {
      return;
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
                display={this.display}
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
                  content={this.resultTemplatesProvider.getTemplateContent(
                    result
                  )}
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
