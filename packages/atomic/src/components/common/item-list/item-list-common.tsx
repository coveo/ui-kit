import {
  FocusTargetController,
  getFirstFocusableDescendant,
} from '../../../utils/accessibility-utils';
import {updateBreakpoints} from '../../../utils/replace-breakpoint';
import {defer, once} from '../../../utils/utils';
import {AnyItem} from '../interface/item';
import {AtomicCommonStore, AtomicCommonStoreData} from '../interface/store';
import {
  ItemDisplayDensity,
  ItemDisplayImageSize,
} from '../layout/display-options';

export const resultComponentClass = 'result-component';

export type ItemRenderingFunction<SpecificResult extends AnyItem = AnyItem> =
  | ((result: SpecificResult, root: HTMLElement) => string)
  | undefined;

export interface ItemListCommonProps {
  store: AtomicCommonStore<AtomicCommonStoreData>;
  loadingFlag: string;
  host: HTMLElement;
  nextNewItemTarget: FocusTargetController;
  getCurrentNumberOfItems: () => number;
  getIsLoading: () => boolean;
  engineSubscribe: (cb: () => void) => () => void;
}

export class ItemListCommon {
  private indexOfResultToFocus?: number;
  private firstResultEl?: HTMLElement;
  private updateBreakpointsOnce: () => void;

  constructor(private props: ItemListCommonProps) {
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
    density: ItemDisplayDensity,
    imageSize: ItemDisplayImageSize
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
    this.props.nextNewItemTarget.setTarget(elementToFocus);
  }

  public focusOnNextNewResult() {
    this.indexOfResultToFocus = this.props.getCurrentNumberOfItems();
    this.props.nextNewItemTarget.focusOnNextTarget();
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
          this.props.nextNewItemTarget.setTarget(elementToFocus);
          this.props.nextNewItemTarget.focus();
          this.firstResultEl = undefined;
          unsub();
          resolve();
        }
      });
    });
  }
}
