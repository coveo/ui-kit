import type {
  ItemDisplayDensity,
  ItemDisplayImageSize,
} from '@/src/components/common/layout/item-layout-utils';
import {
  type FocusTargetController,
  getFirstFocusableDescendant,
} from '@/src/utils/accessibility-utils';
import {defer, once} from '@/src/utils/utils';
import {updateBreakpoints} from '../../../utils/replace-breakpoint-utils';
import type {CommerceStore} from '../../commerce/atomic-commerce-interface/store';
import type {CommerceRecommendationStore} from '../../commerce/atomic-commerce-recommendation-interface/store';
import type {InsightStore} from '../../insight/atomic-insight-interface/store';
import type {RecsStore} from '../../recommendations/atomic-recs-interface/store';
import type {SearchStore} from '../../search/atomic-search-interface/store';
import type {AnyItem} from './unfolded-item';

export const resultComponentClass = 'result-component';

export type ItemRenderingFunction<SpecificResult extends AnyItem = AnyItem> =
  | ((
      result: SpecificResult,
      root: HTMLElement,
      linkContainer?: HTMLElement
    ) => string)
  | undefined;

export interface ItemListCommonProps {
  store:
    | CommerceStore
    | CommerceRecommendationStore
    | RecsStore
    | InsightStore
    | SearchStore;
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
    this.props.store.state.resultList = this;
    this.updateBreakpointsOnce = once(() => updateBreakpoints(this.props.host));
    this.props.nextNewItemTarget.registerFocusCallback(() => {
      this.indexOfResultToFocus = undefined;
    });
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

  // TODO - KIT-4227 refactor this method using requestAnimationFrame instead of defer, e.g.,
  // public async focusOnFirstResultAfterNextSearch2() {
  //   window.requestAnimationFrame(() => {
  //     return new Promise<void>((resolve) => {
  //       if (this.props.getIsLoading()) {
  //         this.firstResultEl = undefined;
  //       }

  //       const unsub = this.props.engineSubscribe(async () => {
  //         window.requestAnimationFrame(() => {
  //           if (!this.props.getIsLoading() && this.firstResultEl) {
  //             const elementToFocus =
  //               getFirstFocusableDescendant(this.firstResultEl) ??
  //               this.firstResultEl;
  //             this.props.nextNewItemTarget.setTarget(elementToFocus);
  //             this.props.nextNewItemTarget.focus();
  //             this.firstResultEl = undefined;
  //             unsub();
  //             resolve();
  //           }
  //         });
  //       });
  //     });
  //   });
  // }
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
