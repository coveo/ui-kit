import {FunctionalComponent, h, Host} from '@stencil/core';
import {
  FoldedCollection,
  FoldedResult,
  FoldedResultListState,
  Result,
  ResultListState,
  ResultsPerPageState,
  ResultTemplatesManager,
  ResultTemplate,
  buildResultTemplatesManager,
  ResultListProps,
} from '@coveo/headless';
import {InitializableComponent} from '../../../utils/initialization-utils';
import {TemplateContent} from '../result-templates/result-template-common';
import {TableDisplayResults} from './table-display-results';
import {ListDisplayResults} from './list-display-results';
import {GridDisplayResults} from './grid-display-results';
import {
  ListDisplayResultsPlaceholder,
  GridDisplayResultsPlaceholder,
  TableDisplayResultsPlaceholder,
} from '../../common/atomic-result-placeholder/placeholders';
import {once} from '../../../utils/utils';
import {updateBreakpoints} from '../../../utils/replace-breakpoint';
import {
  FocusTargetController,
  getFirstFocusableDescendant,
} from '../../../utils/accessibility-utils';
import {
  DisplayOptions,
  ResultPlaceholderProps,
} from '../../common/result-list/result-list';
import {Bindings} from '../atomic-search-interface/atomic-search-interface';
import {
  ResultDisplayDensity,
  ResultDisplayImageSize,
  ResultDisplayLayout,
  getResultDisplayClasses,
} from '../../common/layout/display-options';

export interface BaseResultList extends InitializableComponent {
  host: HTMLElement;
  templateHasError: boolean;
  resultListCommon: ResultListCommon;

  setRenderFunction?: SetRenderFunction;

  density?: ResultDisplayDensity;
  imageSize?: ResultDisplayImageSize;
  image?: ResultDisplayImageSize;
  display?: ResultDisplayLayout;
}

export type SetRenderFunction = (
  render: ResultRenderingFunction
) => Promise<void>;

export interface ResultsProps extends DisplayOptions {
  host: HTMLElement;
  bindings: Bindings;
  resultListState: FoldedResultListState | ResultListState;
  resultListCommon: ResultListCommon;
  getContentOfResultTemplate(
    result: Result | FoldedResult
  ): HTMLElement | DocumentFragment;
  newResultRef?: (element: HTMLElement) => void;
  indexOfResultToFocus?: number;

  classes: string;
  renderingFunction?: ResultRenderingFunction;
}

interface TemplateElement extends HTMLElement {
  getTemplate(): Promise<ResultTemplate<DocumentFragment> | null>;
}

export interface RenderListOptions extends DisplayOptions {
  host: HTMLElement;
  templateHasError: boolean;
  resultListState: FoldedResultListState | ResultListState;
  resultsPerPageState: ResultsPerPageState;
  setListWrapperRef(el: HTMLDivElement | undefined): void;
  getContentOfResultTemplate(
    result: Result | FoldedResult
  ): HTMLElement | DocumentFragment;
  ready: boolean;
}

interface ResultListCommonOptions {
  host: HTMLElement;
  bindings: Bindings;
  templateElements: NodeListOf<TemplateElement>;
  includeDefaultTemplate?: boolean;
  loadingFlag?: string;
  onReady(): void;
  onError(): void;
  nextNewResultTarget?: FocusTargetController;
}

export class ResultListCommon {
  private host: HTMLElement;
  private bindings: Bindings;
  private render?: ResultRenderingFunction;
  private updateBreakpoints?: (host: HTMLElement) => void;
  private nextNewResultTarget?: FocusTargetController;
  private indexOfResultToFocus?: number;

  public resultTemplatesManager!: ResultTemplatesManager<TemplateContent>;
  public resultListControllerProps?: ResultListProps;
  public loadingFlag?: string;

  constructor(opts: ResultListCommonOptions) {
    this.host = opts.host;
    this.bindings = opts.bindings;
    this.loadingFlag = opts.loadingFlag;

    if (this.loadingFlag) {
      this.bindings.store.setLoadingFlag(this.loadingFlag);
    }
    this.updateBreakpoints = once((host: HTMLElement) => {
      updateBreakpoints(host);
    });
    this.nextNewResultTarget = opts.nextNewResultTarget;

    this.registerResultTemplates(
      opts.templateElements,
      opts.includeDefaultTemplate,
      opts.onReady,
      opts.onError
    );
  }

  set renderingFunction(render: ResultRenderingFunction) {
    this.render = render;
  }

  public focusOnNextNewResult(
    resultListState: FoldedResultListState | ResultListState
  ) {
    if (!this.nextNewResultTarget) {
      throw "Cannot focus on next new result if nextNewResultTarget isn't defined";
    }
    this.indexOfResultToFocus = resultListState.results.length;
    this.nextNewResultTarget.focusOnNextTarget();
  }

  public getTemplate(result: Result) {
    return this.resultTemplatesManager.selectTemplate(result);
  }

  public getContentOfResultTemplate(
    resultOrFolded: Result | FoldedResult
  ): HTMLElement | DocumentFragment {
    const result = (resultOrFolded as FoldedResult).result || resultOrFolded;
    return this.getTemplate(result)!;
  }

  private onFirstNewResultRendered(element: HTMLElement) {
    if (!element.children.length && !element.shadowRoot?.children.length) {
      return;
    }
    this.indexOfResultToFocus = undefined;
    const elementToFocus = getFirstFocusableDescendant(element) ?? element;
    this.nextNewResultTarget?.setTarget(elementToFocus);
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

  public async registerResultTemplates(
    elements: NodeListOf<TemplateElement>,
    includeDefaultTemplate = true,
    onReady: () => void,
    onError: () => void
  ) {
    this.resultTemplatesManager = buildResultTemplatesManager(
      this.bindings.engine
    );

    const customTemplates = await Promise.all(
      Array.from(elements).map(async (resultTemplateElement) => {
        const template = await resultTemplateElement.getTemplate();
        if (!template) {
          onError();
        }
        return template;
      })
    );

    const templates = (
      includeDefaultTemplate ? [this.makeDefaultTemplate()] : []
    ).concat(
      customTemplates.filter(
        (template) => template
      ) as ResultTemplate<DocumentFragment>[]
    );

    this.resultTemplatesManager.registerTemplates(...templates);
    onReady();
  }

  public getResultId(
    result: Result | FoldedCollection,
    resultListState: FoldedResultListState | ResultListState
  ) {
    return (
      this.getUnfoldedResult(result).uniqueId + resultListState.searchResponseId
    );
  }

  public getUnfoldedResult(result: Result | FoldedResult): Result {
    return (result as FoldedResult).result ?? result;
  }

  public get scrollHasReachedEndOfList() {
    const childEl = this.host.shadowRoot?.firstElementChild as HTMLElement;
    return window.innerHeight + window.scrollY >= childEl?.offsetHeight;
  }

  private getClasses(
    display: ResultDisplayLayout = 'list',
    density: ResultDisplayDensity,
    imageSize: ResultDisplayImageSize,
    firstSearchExecuted: boolean,
    isLoading: boolean,
    displayPlaceholders: boolean
  ): string {
    const classes = getResultDisplayClasses(display, density, imageSize);
    if (firstSearchExecuted && isLoading) {
      classes.push('loading');
    }
    if (displayPlaceholders) {
      classes.push('placeholder');
    }
    return classes.join(' ');
  }

  public renderList({
    host,
    display,
    density,
    imageSize,
    templateHasError,
    resultListState,
    resultsPerPageState,
    setListWrapperRef,
    getContentOfResultTemplate,
    ready,
  }: RenderListOptions) {
    this.updateBreakpoints?.(host);
    if (!ready) {
      return;
    }

    if (resultListState.hasError) {
      return;
    }

    if (resultListState.firstSearchExecuted && !resultListState.hasResults) {
      return;
    }

    const displayPlaceholders = !this.bindings.store.isAppLoaded();

    const classes = this.getClasses(
      display,
      density,
      imageSize!,
      resultListState.firstSearchExecuted,
      resultListState.isLoading,
      displayPlaceholders
    );
    return (
      <Host>
        {templateHasError && <slot></slot>}
        <div class={`list-wrapper ${classes}`} ref={setListWrapperRef}>
          <ResultDisplayWrapper classes={classes} display={display}>
            {displayPlaceholders && (
              <ResultsPlaceholder
                display={display}
                density={density}
                imageSize={imageSize}
                resultsPerPageState={resultsPerPageState}
              />
            )}
            {resultListState.firstSearchExecuted && (
              <Results
                classes={classes}
                bindings={this.bindings}
                host={host}
                display={display}
                density={density}
                imageSize={imageSize}
                resultListState={resultListState}
                resultListCommon={this}
                getContentOfResultTemplate={getContentOfResultTemplate}
                renderingFunction={this.render}
                indexOfResultToFocus={this.indexOfResultToFocus}
                newResultRef={(element) =>
                  this.onFirstNewResultRendered(element)
                }
              />
            )}
          </ResultDisplayWrapper>
        </div>
      </Host>
    );
  }
}

export type ResultRenderingFunction = (
  result: Result | FoldedResult,
  root: HTMLElement
) => string;

const ResultDisplayWrapper: FunctionalComponent<{
  display?: ResultDisplayLayout;
  classes: string;
}> = (props, children) => {
  if (props.display === 'table') {
    return children;
  }
  return (
    <div class={`list-root ${props.classes}`} part="result-list">
      {children}
    </div>
  );
};

const ResultsPlaceholder: FunctionalComponent<
  ResultPlaceholderProps<ResultsPerPageState>
> = (props) => {
  switch (props.display) {
    case 'table':
      return <TableDisplayResultsPlaceholder {...props} />;
    case 'grid':
      return <GridDisplayResultsPlaceholder {...props} />;
    default:
      return <ListDisplayResultsPlaceholder {...props} />;
  }
};

const Results: FunctionalComponent<ResultsProps> = (props) => {
  if (!props.resultListState.results.length) {
    return null;
  }
  switch (props.display) {
    case 'table':
      return <TableDisplayResults {...props} />;
    case 'grid':
      return <GridDisplayResults {...props} />;
    default:
      return <ListDisplayResults {...props} />;
  }
};
