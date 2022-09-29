import {AnyBindings} from '../interface/bindings';
import {
  ResultDisplayDensity,
  ResultDisplayImageSize,
  ResultDisplayLayout,
} from '../layout/display-options';
import {AnyResult} from '../interface/result';
import {FocusTargetController} from '../../../utils/accessibility-utils';
import {ResultTemplateProvider} from './result-template-provider';

export interface ResultListRenderer {
  getResultId(result: AnyResult): string;
  listClasses: string;
  setNewResultRef(element: HTMLElement, resultIndex: number): void;
}

export interface ResultListCommonProps {
  bindings: AnyBindings;
  host: HTMLElement;
  loadingFlag: string;
  resultTemplateProvider: ResultTemplateProvider;
  nextNewResultTarget: FocusTargetController;
  getDisplay(): ResultDisplayLayout;
  getDensity(): ResultDisplayDensity;
  getImageSize(): ResultDisplayImageSize;
  getResultListState(): ResultListCommonState<AnyResult>;
  getNumberOfPlaceholders(): number;
  getResultRenderingFunction(): ResultRenderingFunction;
  // TODO: add generic way to get a result component to render (not only atomic-result)
}

export interface ResultListCommonState<Result extends AnyResult> {
  hasError: boolean;
  firstSearchExecuted: boolean;
  hasResults: boolean;
  isLoading: boolean;
  results: Result[];
  searchResponseId: string;
}

export interface ResultListDisplayProps
  extends ResultListRenderer,
    ResultListCommonProps {}

export type ResultRenderingFunction =
  | ((result: AnyResult, root: HTMLElement) => string)
  | undefined;
