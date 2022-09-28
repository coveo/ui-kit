import {AnyBindings} from '../interface/bindings';
import {
  ResultDisplayDensity,
  ResultDisplayImageSize,
  ResultDisplayLayout,
} from '../layout/display-options';
import {AnyResult} from '../interface/result';
import {FocusTargetController} from '../../../utils/accessibility-utils';
import {ResultTemplateProvider} from './result-template-provider';
import {AtomicCommonStore, AtomicCommonStoreData} from '../interface/store';
import {VNode} from '@stencil/core';

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
  renderResult(props: ResultRendererProps): VNode;
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

export interface ResultRendererProps {
  key?: string;
  part?: string;
  result: AnyResult;
  content?: ParentNode;
  loadingFlag?: string;
  store: AtomicCommonStore<AtomicCommonStoreData>;
  display?: ResultDisplayLayout;
  density?: ResultDisplayDensity;
  imageSize?: ResultDisplayImageSize;
  ref?: (elm?: HTMLElement | undefined) => void;
  renderingFunction?: ResultRenderingFunction;
}

export type ResultRenderingFunction =
  | ((result: AnyResult, root: HTMLElement) => string)
  | undefined;
