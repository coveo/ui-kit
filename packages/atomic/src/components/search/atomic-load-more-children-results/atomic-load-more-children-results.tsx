import {Result, FoldedResultListState} from '@coveo/headless';
import {Component, Element, h, Prop, State} from '@stencil/core';
import {buildCustomEvent} from '../../../utils/event-utils';
import {InitializeBindings} from '../../../utils/initialization-utils';
import {Button} from '../../common/button';
import {
  DisplayConfig,
  ItemDisplayConfigContext,
} from '../../common/item-list/item-decorators';
import {FoldedItemListStateContext} from '../../common/item-list/item-list-decorators';
import {getItemDisplayClasses} from '../../common/layout/display-options';
import {Bindings} from '../atomic-search-interface/atomic-search-interface';
import {ResultContext} from '../result-template-components/result-template-decorators';

/**
 * The `atomic-load-more-children-results` component allows to load the full collection for a folded result.
 *
 * @part button - The button used to load more results.
 */
@Component({
  tag: 'atomic-load-more-children-results',
  styleUrl: 'atomic-load-more-children-results.pcss',
  shadow: true,
})
export class AtomicLoadMoreChildrenResults {
  @InitializeBindings() public bindings!: Bindings;
  @ResultContext() public result!: Result;
  @State() public error!: Error;
  @Element() host!: HTMLElement;

  @FoldedItemListStateContext()
  @State()
  private foldedResultListState!: FoldedResultListState;

  @ItemDisplayConfigContext()
  private displayConfig!: DisplayConfig;

  /**
   * The non-localized label for the button used to load more results.
   */
  @Prop() public label = 'load-all-results';

  private get collection() {
    if (!this.result.raw.foldingcollection) {
      return null;
    }
    return this.foldedResultListState.results.find(
      (r) =>
        r.result.raw.foldingcollection === this.result.raw.foldingcollection
    )!;
  }

  private loadFullCollection() {
    this.host.dispatchEvent(
      buildCustomEvent('atomic/loadCollection', this.collection)
    );
  }

  private get hasMoreResults() {
    return this.collection?.moreResultsAvailable;
  }

  private get isLoading() {
    return Boolean(this.collection?.isLoadingMoreResults);
  }

  private get hasChildren() {
    return Boolean(this.collection?.children.length);
  }

  private get buttonClass() {
    if (this.hasChildren) {
      return 'has-children';
    }
    return '';
  }

  private get wrapperClass() {
    return getItemDisplayClasses(
      'list',
      this.displayConfig.density,
      this.displayConfig.imageSize
    ).join(' ');
  }

  public render() {
    if (!this.foldedResultListState || !this.collection) {
      return null;
    }

    return (
      <div class={this.wrapperClass}>
        {this.hasMoreResults && (
          <Button
            part="button"
            style="text-primary"
            onClick={() => this.loadFullCollection()}
            class={this.buttonClass}
            disabled={this.isLoading}
          >
            {this.bindings.i18n.t(this.label)}
          </Button>
        )}
      </div>
    );
  }
}
