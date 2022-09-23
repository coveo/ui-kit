import {AnyBindings} from '../interface/bindings';
import {
  ResultDisplayDensity,
  ResultDisplayImageSize,
  ResultDisplayLayout,
} from '../layout/display-options';
import {AnyResult} from '../interface/result';
import {ResultTemplate} from '@coveo/headless';
import {FocusTargetController} from '../../../utils/accessibility-utils';

export interface ResultListRenderer {
  getTemplateContent(result: AnyResult): HTMLElement | DocumentFragment;
  getResultId(result: AnyResult): string;
  listClasses: string;
  setNewResultRef(element: HTMLElement, resultIndex: number): void;
}

export interface ResultListCommonProps {
  bindings: AnyBindings;
  host: HTMLElement;
  loadingFlag: string;
  getDisplay(): ResultDisplayLayout;
  getDensity(): ResultDisplayDensity;
  getImageSize(): ResultDisplayImageSize;
  getResultListState(): ResultListCommonState<AnyResult>;
  getNumberOfPlaceholders(): number;
  getResultTemplateRegistered(): boolean;
  setResultTemplateRegistered(value: boolean): void;
  getTemplateHasError(): boolean;
  setTemplateHasError(value: boolean): void;
  getResultRenderingFunction(): ResultRenderingFunction | null;
  resultTemplateSelector: string;
  layoutSelector?: string;
  nextNewResultTarget: FocusTargetController;
  // TODO: add generic way to get a result component (not only atomic-result)
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

export interface TemplateElement extends HTMLElement {
  getTemplate(): Promise<ResultTemplate<DocumentFragment> | null>;
}

export type ResultRenderingFunction =
  | ((result: AnyResult, root: HTMLElement) => string)
  | undefined;
