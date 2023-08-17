import {InteractiveResult} from '@coveo/headless';
import {VNode} from '@stencil/core';
import {FocusTargetController} from '../../../utils/accessibility-utils';
import {AnyBindings} from '../interface/bindings';
import {AnyResult} from '../interface/result';
import {AtomicCommonStore, AtomicCommonStoreData} from '../interface/store';
import {
  ResultDisplayDensity,
  ResultDisplayImageSize,
  ResultDisplayLayout,
  ResultTarget,
} from '../layout/display-options';
import {ResultTemplateProvider} from './result-template-provider';

export interface ResultListRenderer {
  getResultId(result: AnyResult): string;
  listClasses: string;
  setNewResultRef(element: HTMLElement, resultIndex: number): void;
}

export interface ResultListCommonProps<
  SpecificResult extends AnyResult = AnyResult
> {
  bindings: AnyBindings;
  host: HTMLElement;
  loadingFlag: string;
  resultTemplateProvider: ResultTemplateProvider;
  nextNewResultTarget: FocusTargetController;
  gridCellLinkTarget?: ResultTarget;
  getLayoutDisplay(): ResultDisplayLayout;
  getResultDisplay(): ResultDisplayLayout;
  getDensity(): ResultDisplayDensity;
  getImageSize(): ResultDisplayImageSize;
  getResultListState(): ResultListCommonState<SpecificResult>;
  getNumberOfPlaceholders(): number;
  getResultRenderingFunction(): ResultRenderingFunction;
  renderResult(props: ResultRendererProps<SpecificResult>): VNode;
  getInteractiveResult(result: AnyResult): InteractiveResult;
}

export interface ResultListCommonState<SpecificResult extends AnyResult> {
  hasError: boolean;
  firstSearchExecuted: boolean;
  hasResults: boolean;
  isLoading: boolean;
  results: SpecificResult[];
  searchResponseId: string;
}

export interface ResultListDisplayProps
  extends ResultListRenderer,
    ResultListCommonProps {}

export interface ResultRendererProps<
  SpecificResult extends AnyResult = AnyResult
> {
  key?: string;
  part?: string;
  result: SpecificResult;
  interactiveResult: InteractiveResult;
  content?: ParentNode;
  loadingFlag?: string;
  store: AtomicCommonStore<AtomicCommonStoreData>;
  display?: ResultDisplayLayout;
  density?: ResultDisplayDensity;
  imageSize?: ResultDisplayImageSize;
  ref?: (elm?: HTMLElement | undefined) => void;
  renderingFunction?: ResultRenderingFunction;
}

export type ResultRenderingFunction<
  SpecificResult extends AnyResult = AnyResult
> = ((result: SpecificResult, root: HTMLElement) => string) | undefined;
