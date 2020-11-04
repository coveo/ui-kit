import {
  InfiniteScrolling,
  buildInfiniteScrolling,
  Engine,
  InfiniteScrollingState,
  Unsubscribe,
} from '@coveo/headless';
import {Component, h, State} from '@stencil/core';
import {Initialization} from '../../utils/initialization-utils';

@Component({
  tag: 'atomic-infinite-scrolling',
  shadow: true,
})
export class AtomicInfiniteScrolling {
  @State() state!: InfiniteScrollingState;

  private engine!: Engine;
  private infiniteScrolling!: InfiniteScrolling;
  private unsubscribe: Unsubscribe = () => {};

  @Initialization()
  public initialize() {
    this.infiniteScrolling = buildInfiniteScrolling(this.engine);
    this.unsubscribe = this.infiniteScrolling.subscribe(() =>
      this.updateState()
    );
  }

  public disconnectedCallback() {
    this.unsubscribe();
  }

  private get canFetchMoreResults() {
    return this.state.enabled && !this.state.isLoading;
  }

  private updateState() {
    this.state = this.infiniteScrolling.state;
  }

  public render() {
    return (
      <button
        onClick={() => this.infiniteScrolling.fetchMoreResults()}
        disabled={!this.canFetchMoreResults}
      >
        Fetch more results
      </button>
    );
  }
}
