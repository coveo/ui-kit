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
} from '../atomic-result/atomic-result-display-options';
import {TemplateContent} from '../result-templates/result-template-common';

interface DisplayProps {
  density: ResultDisplayDensity;
  imageSize?: ResultDisplayImageSize;
  image?: ResultDisplayImageSize;
  display?: ResultDisplayLayout;
}
export interface ResultPlaceholderProps extends Omit<DisplayProps, 'image'> {
  resultsPerPageState: ResultsPerPageState;
}
export interface ResultsProps extends DisplayProps {
  resultListState: FoldedResultListState | ResultListState;
  resultListCommon: ResultListCommon;
  bindings: Bindings;
  host: HTMLElement;
  getContentOfResultTemplate(
    result: Result | FoldedResult
  ): HTMLElement | DocumentFragment;

  classes: string;
}

export interface AtomicResultListBase extends Omit<ResultsProps, 'classes'> {
  templateHasError: boolean;
  listWrapperRef?: HTMLDivElement;
  resultsPerPageState: ResultsPerPageState;

  resultListCommon: ResultListCommon;

  resultList: FoldedResultList | ResultList;
}

interface TemplateElement extends HTMLElement {
  getTemplate(): Promise<ResultTemplate<DocumentFragment> | null>;
}

interface ResultListCommonProps {
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

  public resultTemplatesManager!: ResultTemplatesManager<TemplateContent>;
  public resultListControllerProps?: ResultListProps;

  constructor(props: ResultListCommonProps) {
    this.bindings = props.bindings;

    if (props.fieldsToInclude) {
      this.resultListControllerProps = {
        options: {
          fieldsToInclude: this.determineAllFieldsToInclude(
            props.fieldsToInclude
          ),
        },
      };
    }

    this.registerResultTemplates(
      props.templateElements,
      props.includeDefaultTemplate,
      props.onReady,
      props.onError
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
}

export type ResultRenderingFunction = (
  result: Result | FoldedResult
) => HTMLElement;
