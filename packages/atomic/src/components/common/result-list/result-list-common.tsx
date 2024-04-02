import {
  FocusTargetController,
  getFirstFocusableDescendant,
} from '../../../utils/accessibility-utils';
import {updateBreakpoints} from '../../../utils/replace-breakpoint';
import {defer, once} from '../../../utils/utils';
import {AnyResult} from '../interface/result';
import {AtomicCommonStore, AtomicCommonStoreData} from '../interface/store';
import {
  ResultDisplayDensity,
  ResultDisplayImageSize,
} from '../layout/display-options';

export const resultComponentClass = 'result-component';

export type ResultRenderingFunction<
  SpecificResult extends AnyResult = AnyResult,
> = ((result: SpecificResult, root: HTMLElement) => string) | undefined;

export interface ResultListCommonProps {
  store: AtomicCommonStore<AtomicCommonStoreData>;
  loadingFlag: string;
  host: HTMLElement;
  nextNewResultTarget: FocusTargetController;
  getCurrentNumberOfResults: () => number;
  getIsLoading: () => boolean;
  engineSubscribe: (cb: () => void) => () => void;
}

export class ResultListCommon {
  private indexOfResultToFocus?: number;
  private firstResultEl?: HTMLElement;
  private updateBreakpointsOnce: () => void;

  constructor(private props: ResultListCommonProps) {
    this.props.store.setLoadingFlag(this.props.loadingFlag);
    this.props.store.registerResultList(this);
    this.updateBreakpointsOnce = once(() => updateBreakpoints(this.props.host));
  }

  public updateBreakpoints() {
    this.updateBreakpointsOnce();
  }

  public getResultId(
    uniqueIdOnResult: string,
    searchResponseId: string,
    density: ResultDisplayDensity,
    imageSize: ResultDisplayImageSize
  ) {
    return `${uniqueIdOnResult}${searchResponseId}${density}${imageSize}`;
  }

  public setNewResultRef(element: HTMLElement, resultIndex: number) {
    if (resultIndex === 0) {
      this.firstResultEl = element;
    }
    if (resultIndex !== this.indexOfResultToFocus) {
      return;
    }

    if (!element.children.length && !element.shadowRoot?.children.length) {
      return;
    }

    this.indexOfResultToFocus = undefined;
    const elementToFocus = getFirstFocusableDescendant(element) ?? element;
    this.props.nextNewResultTarget.setTarget(elementToFocus);
  }

  public focusOnNextNewResult() {
    this.indexOfResultToFocus = this.props.getCurrentNumberOfResults();
    this.props.nextNewResultTarget.focusOnNextTarget();
  }

  public async focusOnFirstResultAfterNextSearch() {
    await defer();
    return new Promise<void>((resolve) => {
      if (this.props.getIsLoading()) {
        this.firstResultEl = undefined;
      }

      const unsub = this.props.engineSubscribe(async () => {
        await defer();
        if (!this.props.getIsLoading() && this.firstResultEl) {
          const elementToFocus =
            getFirstFocusableDescendant(this.firstResultEl) ??
            this.firstResultEl;
          this.props.nextNewResultTarget.setTarget(elementToFocus);
          this.props.nextNewResultTarget.focus();
          this.firstResultEl = undefined;
          unsub();
          resolve();
        }
      });
    });
  }
}
