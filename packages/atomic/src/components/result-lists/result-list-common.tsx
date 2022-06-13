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
  EcommerceDefaultFieldsToInclude,
} from '@coveo/headless';
import {
  Bindings,
  InitializableComponent,
} from '../../utils/initialization-utils';
import {
  ResultDisplayDensity,
  ResultDisplayImageSize,
  ResultDisplayLayout,
  getResultDisplayClasses,
} from '../atomic-result/atomic-result-display-options';
import {TemplateContent} from '../result-templates/result-template-common';
import {TableDisplayResultsPlaceholder} from './table-display-results-placeholder';
import {TableDisplayResults} from './table-display-results';
import {ListDisplayResults} from './list-display-results';
import {GridDisplayResults} from './grid-display-results';
import {GridDisplayResultsPlaceholder} from './grid-display-results-placeholder';
import {ListDisplayResultsPlaceholder} from './list-display-results-placeholder';
import {once} from '../../utils/utils';
import {updateBreakpoints} from '../../utils/replace-breakpoint';
import {isAppLoaded, setLoadingFlag} from '../../utils/store';
import {isNullOrUndefined} from '@coveo/bueno';

export interface BaseResultList<T = FoldedResult | Result>
  extends InitializableComponent {
  host: HTMLElement;
  templateHasError: boolean;
  resultListCommon: ResultListCommon;

  setRenderFunction?: SetRenderFunction<T>;

  density?: ResultDisplayDensity;
  imageSize?: ResultDisplayImageSize;
  image?: ResultDisplayImageSize;
  display?: ResultDisplayLayout;
}

export type SetRenderFunction<T = FoldedResult | Result> = (
  render: (result: T) => HTMLElement
) => Promise<void>;
interface DisplayOptions {
  density: ResultDisplayDensity;
  imageSize?: ResultDisplayImageSize;
  image?: ResultDisplayImageSize;
  display?: ResultDisplayLayout;
}
export interface ResultPlaceholderProps extends Omit<DisplayOptions, 'image'> {
  resultsPerPageState: ResultsPerPageState;
  isChild?: boolean;
}
export interface ResultsProps extends DisplayOptions {
  host: HTMLElement;
  bindings: Bindings;
  resultListState: FoldedResultListState | ResultListState;
  resultListCommon: ResultListCommon;
  getContentOfResultTemplate(
    result: Result | FoldedResult
  ): HTMLElement | DocumentFragment;

  classes: string;
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
}

interface ResultListCommonOptions {
  host: HTMLElement;
  bindings: Bindings;
  templateElements: NodeListOf<TemplateElement>;
  fieldsToInclude?: string;
  templateFieldsToInclude?: string;
  includeDefaultTemplate?: boolean;
  onReady(): void;
  onError(): void;
  loadingFlag?: string;
}

export class ResultListCommon {
  private host: HTMLElement;
  private bindings: Bindings;
  private render?: ResultRenderingFunction;
  private updateBreakpoints?: (host: HTMLElement) => void;

  public resultTemplatesManager!: ResultTemplatesManager<TemplateContent>;
  public resultListControllerProps?: ResultListProps;
  public loadingFlag?: string;
  public templateFieldsToInclude?: string;

  constructor(opts: ResultListCommonOptions) {
    this.host = opts.host;
    this.bindings = opts.bindings;
    this.loadingFlag = opts.loadingFlag;
    this.templateFieldsToInclude = opts.templateFieldsToInclude;
    if (this.loadingFlag) {
      setLoadingFlag(this.bindings.store, this.loadingFlag);
    }
    this.updateBreakpoints = once((host: HTMLElement) => {
      updateBreakpoints(host);
    });

    if (opts.fieldsToInclude) {
      this.resultListControllerProps = {
        options: {
          fieldsToInclude: this.determineAllFieldsToInclude(
            opts.fieldsToInclude
          ),
        },
      };
    }

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

  private determineAllFieldsToInclude(
    configuredFieldsToInclude: string
  ): string[] {
    if (configuredFieldsToInclude.trim() === '') {
      return [...EcommerceDefaultFieldsToInclude];
    }
    return EcommerceDefaultFieldsToInclude.concat(
      configuredFieldsToInclude.split(',').map((field) => field.trim())
    );
  }

  public getTemplate(result: Result) {
    return this.resultTemplatesManager.selectTemplate(result);
  }

  public getContentOfResultTemplate(
    resultOrFolded: Result | FoldedResult
  ): HTMLElement | DocumentFragment {
    const result = (resultOrFolded as FoldedResult).result || resultOrFolded;
    return this.render
      ? this.render(resultOrFolded)
      : this.getTemplate(result)!;
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

    const fieldsToInclude =
      !isNullOrUndefined(this.templateFieldsToInclude) &&
      this.determineAllFieldsToInclude(this.templateFieldsToInclude!);

    if (fieldsToInclude) {
      templates[0].fields = fieldsToInclude;
    }

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
  }: RenderListOptions) {
    this.updateBreakpoints?.(host);

    if (resultListState.hasError) {
      return;
    }

    if (resultListState.firstSearchExecuted && !resultListState.hasResults) {
      return;
    }

    const displayPlaceholders = !isAppLoaded(this.bindings.store);

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
              />
            )}
          </ResultDisplayWrapper>
        </div>
      </Host>
    );
  }
}

export type ResultRenderingFunction = (
  result: Result | FoldedResult
) => HTMLElement;

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

const ResultsPlaceholder: FunctionalComponent<ResultPlaceholderProps> = (
  props
) => {
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
