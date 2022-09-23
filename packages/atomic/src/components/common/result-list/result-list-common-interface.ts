import {AnyBindings} from '../interface/bindings';
import {
  ResultDisplayDensity,
  ResultDisplayImageSize,
  ResultDisplayLayout,
} from '../layout/display-options';
import {ResultListInfo} from '../../search/atomic-search-interface/store';
import {AnyResult} from '../interface/result';
import {ResultTemplate} from '@coveo/headless';

export interface ResultListRenderer {
  getTemplateContent(result: AnyResult): HTMLElement | DocumentFragment;
  getResultId(result: AnyResult): string;
  listClasses: string;
}

export interface ResultListCommonProps extends ResultListInfo {
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
  resultTemplateSelector: string;
  layoutSelector?: string;
  // renderResult(result: Result, index: number): VNode; TODO: add back some generic way to get a result
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

// TODO: rewrite
export type ResultRenderingFunction = (
  result: AnyResult,
  root: HTMLElement
) => string;
