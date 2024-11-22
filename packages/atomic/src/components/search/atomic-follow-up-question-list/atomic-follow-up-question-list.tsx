import {
  buildSearchBox,
  buildSearchStatus,
  SearchBox,
  SearchBoxState,
  SearchStatus,
  SearchStatusState,
} from '@coveo/headless';
import {Component, Element, State} from '@stencil/core';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {FollowUpQuestionListCommon} from '../../common/follow-up-questions/follow-up-question-list-common';
import {Bindings} from '../atomic-search-interface/atomic-search-interface';

/**
 * @internal
 */
@Component({
  tag: 'atomic-follow-up-question-list',
  styleUrl: 'atomic-follow-up-question-list.css',
  shadow: true,
})
export class AtomicFollowUpQuestionList implements InitializableComponent {
  @InitializeBindings()
  public bindings!: Bindings;

  private searchBox!: SearchBox;
  private searchStatus!: SearchStatus;

  @BindStateToController('searchBox')
  @State()
  private searchBoxState!: SearchBoxState;

  @BindStateToController('searchStatus')
  @State()
  private searchStatusState!: SearchStatusState;

  @State()
  public error!: Error;

  @Element() private host!: HTMLElement;

  private followUpQuestionListCommon!: FollowUpQuestionListCommon;

  public initialize() {
    this.followUpQuestionListCommon = new FollowUpQuestionListCommon({
      host: this.host,
      getBindings: () => this.bindings,
      getSearchBox: () => this.searchBox,
      getSearchBoxState: () => this.searchBoxState,
      getSearchStatus: () => this.searchStatus,
      getSearchStatusState: () => this.searchStatusState,
      subscribeToQueryChange: (handler) =>
        this.searchBox.subscribe(() => {
          if (this.searchBox.state.value !== this.searchBoxState.value) {
            handler(this.searchBox.state.value);
          }
        }),
    });
    this.searchBox = buildSearchBox(this.bindings.engine);
    this.searchStatus = buildSearchStatus(this.bindings.engine);
  }

  public render() {
    return this.followUpQuestionListCommon.render();
  }
}
