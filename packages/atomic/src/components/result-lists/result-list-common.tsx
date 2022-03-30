import {
  FoldedCollection,
  FoldedResult,
  FoldedResultList,
  FoldedResultListState,
  Result,
  ResultList,
  ResultListState,
  ResultsPerPageState,
} from '@coveo/headless';
import {Bindings} from '../../utils/initialization-utils';
import {
  getResultDisplayClasses,
  ResultDisplayDensity,
  ResultDisplayImageSize,
  ResultDisplayLayout,
} from '../atomic-result/atomic-result-display-options';

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
