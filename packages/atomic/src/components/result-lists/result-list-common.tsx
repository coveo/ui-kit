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
import {TemplateContent} from '../result-template/result-template-common';

export interface ResultsProps {
  density: ResultDisplayDensity;
  display?: ResultDisplayLayout;
  bindings: Bindings;
  host: HTMLElement;
  imageSize?: ResultDisplayImageSize;
  image?: ResultDisplayImageSize;
  resultListState: FoldedResultListState | ResultListState;
  getContentOfResultTemplate(
    result: Result | FoldedResult
  ): HTMLElement | DocumentFragment;

  classes: string;
}

export interface AtomicResultListBase extends Omit<ResultsProps, 'classes'> {
  templateHasError: boolean;
  listWrapperRef?: HTMLDivElement;
  resultsPerPageState: ResultsPerPageState;

  resultListCommon?: ResultListCommon;

  resultList: FoldedResultList | ResultList;
}

export function getId(
  result: Result | FoldedCollection,
  resultListState: FoldedResultListState | ResultListState
) {
  return unfolded(result).uniqueId + resultListState.searchResponseId;
}

export function unfolded(result: Result | FoldedResult): Result {
  return (result as FoldedResult).result ?? result;
}

export function getFields(fieldsToInclude: string): string[] {
  if (fieldsToInclude.trim() === '')
    return [...EcommerceDefaultFieldsToInclude];
  return EcommerceDefaultFieldsToInclude.concat(
    fieldsToInclude.split(',').map((field) => field.trim())
  );
}

export function handleInfiniteScroll(
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

function makeDefaultTemplate(): ResultTemplate<DocumentFragment> {
  const content = document.createDocumentFragment();
  const linkEl = document.createElement('atomic-result-link');
  content.appendChild(linkEl);
  return {
    content,
    conditions: [],
  };
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
  private render?: RenderingFunc;

  public resultTemplatesManager!: ResultTemplatesManager<TemplateContent>;
  public listOpts?: ResultListProps;

  constructor(props: ResultListCommonProps) {
    this.bindings = props.bindings;

    if (props.fieldsToInclude) {
      this.listOpts = {
        options: {
          fieldsToInclude: getFields(props.fieldsToInclude),
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

  set renderingFunction(render: RenderingFunc) {
    this.render = render;
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

  async registerResultTemplates(
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
      includeDefaultTemplate ? [makeDefaultTemplate()] : []
    ).concat(
      customTemplates.filter(identity) as ResultTemplate<DocumentFragment>[]
    );

    this.resultTemplatesManager.registerTemplates(...templates);
    onReady();
  }

  componentDidRender(
    resultListState: FoldedResultListState | ResultListState,
    listWrapperRef?: HTMLDivElement
  ) {
    if (resultListState.firstSearchExecuted) {
      listWrapperRef?.classList.remove('placeholder');
    }
  }
}

export type RenderingFunc = (result: Result | FoldedResult) => HTMLElement;
