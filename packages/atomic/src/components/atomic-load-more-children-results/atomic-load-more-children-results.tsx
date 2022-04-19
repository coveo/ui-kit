import {Result, FoldedResultListState} from '@coveo/headless';
import {Component, Element, h, Prop, State} from '@stencil/core';
import {buildCustomEvent} from '../../utils/event-utils';
import {Bindings, InitializeBindings} from '../../utils/initialization-utils';
import {Button} from '../common/button';
import {FoldedResultListStateContext} from '../result-lists/result-list-decorators';
import {ResultContext} from '../result-template-components/result-template-decorators';

/**
 * The `atomic-load-more-children-results` component allows to load the full collection for a folded result.
 * @internal
 * @part button - The wrapper for the entire facet.
 */
@Component({
  tag: 'atomic-load-more-children-results',
})
export class AtomicLoadMoreChildrenResults {
  @InitializeBindings() public bindings!: Bindings;
  @ResultContext() public result!: Result;
  @State() public error!: Error;
  @Element() host!: HTMLElement;

  @FoldedResultListStateContext()
  @State()
  private foldedResultListState!: FoldedResultListState;

  /**
   * The label for the button used to load more results.
   *
   * @defaultValue `Load all results`
   */
  @Prop() public label = '';

  private getCollection() {
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
    return this.getCollection().moreResultsAvailable;
  }

  private isLoading() {
    return Boolean(this.getCollection().isLoadingMoreResults);
  }

  public render() {
    if (!this.foldedResultListState) {
      return null;
    }

    return (
      <div>
        {this.hasMoreResults() && !this.isLoading() && (
          <Button
            style="text-primary"
            onClick={() => this.loadFullCollection()}
            part="button"
          >
            {this.label || this.bindings.i18n.t('load-all-results')}
          </Button>
        )}
      </div>
    );
  }
}
