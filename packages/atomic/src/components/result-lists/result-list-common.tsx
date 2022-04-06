import {FunctionalComponent, h, Host} from '@stencil/core';
import {
  FoldedCollection,
  FoldedResult,
  FoldedResultList,
  FoldedResultListState,
  Result,
  ResultList,
  ResultListState,
  ResultsPerPageState,
  ResultTemplatesManager,
  ResultTemplate,
  buildResultTemplatesManager,
  ResultListProps,
  EcommerceDefaultFieldsToInclude,
} from '@coveo/headless';
import {identity} from 'lodash';
import {Bindings} from '../../utils/initialization-utils';
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
export interface AtomicResultListBaseComponent
  extends Omit<ResultsProps, 'classes'> {
  templateHasError: boolean;
  listWrapperRef?: HTMLDivElement;
  resultsPerPageState: ResultsPerPageState;

  resultListCommon: ResultListCommon;

  resultList: FoldedResultList | ResultList;
}
interface DisplayOptions {
  density: ResultDisplayDensity;
  imageSize?: ResultDisplayImageSize;
  image?: ResultDisplayImageSize;
  display?: ResultDisplayLayout;
}
export interface ResultPlaceholderProps extends Omit<DisplayOptions, 'image'> {
  resultsPerPageState: ResultsPerPageState;
}
export interface ResultsProps extends DisplayOptions {
  resultListState: FoldedResultListState | ResultListState;
  resultListCommon: ResultListCommon;
  bindings: Bindings;
  host: HTMLElement;
  getContentOfResultTemplate(
    result: Result | FoldedResult
  ): HTMLElement | DocumentFragment;

  classes: string;
}

interface TemplateElement extends HTMLElement {
  getTemplate(): Promise<ResultTemplate<DocumentFragment> | null>;
}

interface ResultListCommonOptions {
  bindings: Bindings;
  templateElements: NodeListOf<TemplateElement>;
  fieldsToInclude?: string;
  includeDefaultTemplate?: boolean;
  onReady(): void;
  onError(): void;
}

export class ResultListCommon {
  private bindings: Bindings;
  private render?: ResultRenderingFunction;
  private updateBreakpoints?: (host: HTMLElement) => void;

  public resultTemplatesManager!: ResultTemplatesManager<TemplateContent>;
  public resultListControllerProps?: ResultListProps;

  constructor(opts: ResultListCommonOptions) {
    this.bindings = opts.bindings;
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
    if (configuredFieldsToInclude.trim() === '')
      return [...EcommerceDefaultFieldsToInclude];
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
    return this.render ? this.render(result) : this.getTemplate(result)!;
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
      customTemplates.filter(identity) as ResultTemplate<DocumentFragment>[]
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

  public handleInfiniteScroll(
    isEnabled: boolean,
    host: HTMLElement,
    resultList: ResultList | FoldedResultList
  ) {
    if (!isEnabled) {
      return;
    }

    const hasReachedEndOfElement =
      window.innerHeight + window.scrollY >= host.offsetHeight;

    if (hasReachedEndOfElement) {
      resultList.fetchMoreResults();
    }
  }

  public componentDidRender(
    resultListState: FoldedResultListState | ResultListState,
    listWrapperRef?: HTMLDivElement
  ) {
    if (resultListState.firstSearchExecuted) {
      listWrapperRef?.classList.remove('placeholder');
    }
  }

  private getClasses({
    display = 'list',
    density,
    imageSize,
    image,
    resultListState,
    resultList,
  }: AtomicResultListBaseComponent): string {
    const classes = getResultDisplayClasses(
      display,
      density,
      (imageSize ?? image)!
    );
    if (resultListState.firstSearchExecuted && resultList.state.isLoading) {
      classes.push('loading');
    }
    return classes.join(' ');
  }

  public renderList(props: AtomicResultListBaseComponent) {
    this.updateBreakpoints?.(props.host);

    if (props.resultListState.hasError) {
      return;
    }

    const classes = this.getClasses(props);
    const imageSize = props.imageSize ?? props.image;
    return (
      <Host>
        {props.templateHasError && <slot></slot>}
        <div
          class={`list-wrapper placeholder ${classes}`}
          ref={(el) => (props.listWrapperRef = el as HTMLDivElement)}
        >
          <ResultDisplayWrapper classes={classes} display={props.display}>
            <ResultsPlaceholder
              display={props.display}
              density={props.density}
              imageSize={imageSize}
              resultsPerPageState={props.resultsPerPageState}
            />
            <Results
              classes={classes}
              bindings={this.bindings}
              host={props.host}
              display={props.display}
              density={props.density}
              imageSize={imageSize}
              resultListState={props.resultListState}
              resultListCommon={props.resultListCommon}
              getContentOfResultTemplate={props.getContentOfResultTemplate}
            />
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
