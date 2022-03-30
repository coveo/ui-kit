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
  buildResultsPerPage,
  SearchEngine,
  ResultListProps,
  FoldedResultListProps,
} from '@coveo/headless';
import {identity} from 'lodash';
import {Bindings} from '../../utils/initialization-utils';
import {TemplateContent} from '../atomic-result-template/atomic-result-template';
import {
  getResultDisplayClasses,
  ResultDisplayDensity,
  ResultDisplayImageSize,
  ResultDisplayLayout,
} from '../atomic-result/atomic-result-display-options';
import {AtomicFoldedResultList} from './atomic-folded-result-list/atomic-folded-result-list';
import {AtomicResultList} from './atomic-result-list/atomic-result-list';

export interface AtomicResultListBase {
  bindings: Bindings;
  host: HTMLElement;
  templateHasError: boolean;
  density: ResultDisplayDensity;
  display?: ResultDisplayLayout;
  imageSize?: ResultDisplayImageSize;
  image: ResultDisplayImageSize;
  listWrapperRef?: HTMLDivElement;
  resultsPerPageState: ResultsPerPageState;

  resultList: FoldedResultList | ResultList;
  resultListState: FoldedResultListState | ResultListState;
  getContentOfResultTemplate(
    result: Result | FoldedResult
  ): HTMLElement | DocumentFragment;
}

export interface ResultsProps
  extends Pick<
    AtomicResultListBase,
    | 'display'
    | 'density'
    | 'host'
    | 'resultListState'
    | 'bindings'
    | 'imageSize'
    | 'image'
    | 'getContentOfResultTemplate'
  > {
  classes: string;
}

export function getClasses({
  display = 'list',
  density,
  imageSize,
  image,
  resultListState,
  resultList,
}: AtomicResultListBase): string {
  const classes = getResultDisplayClasses(display, density, imageSize ?? image);
  if (resultListState.firstSearchExecuted && resultList.state.isLoading) {
    classes.push('loading');
  }
  return classes.join(' ');
}

export function getId(
  result: Result | FoldedCollection,
  resultListState: FoldedResultListState | ResultListState
) {
  return unfolded(result).uniqueId + resultListState.searchResponseId;
}

export function unfolded(result: Result | FoldedResult): Result {
  return (result as FoldedResult).result || result;
}

const defaultFieldsToInclude = [
  'date',
  'author',
  'source',
  'language',
  'filetype',
  'parents',
  'ec_price',
  'ec_name',
  'ec_description',
  'ec_brand',
  'ec_category',
  'ec_item_group_id',
  'ec_shortdesc',
  'ec_thumbnails',
  'ec_images',
  'ec_promo_price',
  'ec_in_stock',
  'ec_cogs',
  'ec_rating',
];

export function getFields(fieldsToInclude: string): string[] {
  if (fieldsToInclude.trim() === '') return [...defaultFieldsToInclude];
  return defaultFieldsToInclude.concat(
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

export async function registerResultTemplates(
  resultTemplatesManager: ResultTemplatesManager<TemplateContent>,
  host: HTMLDivElement
): Promise<boolean> {
  let hasError = false;
  const templates = await Promise.all(
    Array.from(host.querySelectorAll('atomic-result-template')).map(
      async (resultTemplateElement) => {
        const template = await resultTemplateElement.getTemplate();
        if (!template) {
          hasError = true;
        }
        return template;
      }
    )
  );

  resultTemplatesManager.registerTemplates(
    makeDefaultTemplate(),
    ...(templates.filter(identity) as ResultTemplate<DocumentFragment>[])
  );
  return hasError;
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

export async function initializeResultList(
  this: AtomicFoldedResultList | AtomicResultList,
  buildList: (
    engine: SearchEngine<{}>,
    props: ResultListProps | FoldedResultListProps
  ) => ResultList | FoldedResultList
) {
  this.resultTemplatesManager = buildResultTemplatesManager(
    this.bindings.engine
  );
  this.resultList = buildList(this.bindings.engine, {
    options: {
      fieldsToInclude: getFields(this.fieldsToInclude),
    },
  });

  this.resultsPerPage = buildResultsPerPage(this.bindings.engine);
  const error = await registerResultTemplates(
    this.resultTemplatesManager,
    this.host
  );
  if (error) {
    this.templateHasError = true;
  }
  this.ready = true;
}

export function getTemplate(
  resultTemplatesManager: ResultTemplatesManager<TemplateContent>,
  result: Result
): TemplateContent | null {
  return resultTemplatesManager.selectTemplate(result);
}

export function postRenderCleanUp(
  this: AtomicFoldedResultList | AtomicResultList
) {
  if (this.resultListState.firstSearchExecuted) {
    this.listWrapperRef?.classList.remove('placeholder');
  }
}
