import {Result, FoldedResultListState} from '@coveo/headless';
import {Component, Element, h, Prop, State} from '@stencil/core';
import {buildCustomEvent} from '../../utils/event-utils';
import {Bindings, InitializeBindings} from '../../utils/initialization-utils';
import {getResultDisplayClasses} from '../atomic-result/atomic-result-display-options';
import {Button} from '../common/button';
import {
  DisplayConfig,
  ResultContext,
  ResultDisplayConfigContext,
} from '../result-template-components/result-template-decorators';
import {FoldedResultListStateContext} from '../result-lists/result-list-decorators';

/**
 * The `atomic-load-more-children-results` component allows to load the full collection for a folded result.
 * @part button - The wrapper for the entire facet.
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

  @FoldedResultListStateContext()
  @State()
  private foldedResultListState!: FoldedResultListState;

  @ResultDisplayConfigContext()
  private displayConfig!: DisplayConfig;

  /**
   * The label for the button used to load more results.
   *
   * @defaultValue `Load all results`
   */
  @Prop() public label = '';

  private getCollection() {
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
      buildCustomEvent('atomic/loadCollection', this.getCollection())
    );
  }

  private hasMoreResults() {
    return this.getCollection()?.moreResultsAvailable;
  }

  private isLoading() {
    return Boolean(this.getCollection()?.isLoadingMoreResults);
  }

  private hasResults() {
    return Boolean(this.getCollection()?.children.length);
  }

  private getButtonClass() {
    if (this.hasResults()) {
      return 'has-children';
    }
    return '';
  }
  private getWrapperClass() {
    return getResultDisplayClasses(
      'list',
      this.displayConfig.density,
      this.displayConfig.imageSize
    ).join(' ');
  }

  public render() {
    if (!this.foldedResultListState || !this.getCollection()) {
      return null;
    }

    return (
      <div class={this.getWrapperClass()}>
        {this.hasMoreResults() && (
          <Button
            part="button"
            style="text-primary"
            onClick={() => this.loadFullCollection()}
            class={this.getButtonClass()}
            disabled={this.isLoading()}
          >
            {this.label || this.bindings.i18n.t('load-all-results')}
          </Button>
        )}
      </div>
    );
  }
}
