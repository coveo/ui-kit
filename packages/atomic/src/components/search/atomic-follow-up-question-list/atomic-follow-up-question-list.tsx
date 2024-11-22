import {buildSearchBox, SearchBox, SearchBoxState} from '@coveo/headless';
import {Component, h, State} from '@stencil/core';
import {
  FollowUpQuestionCandidate,
  SelectFollowUpQuestionCandidatePayload,
} from '../../../components/common/follow-up-questions/follow-up-question-list-common';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {Bindings} from '../atomic-search-interface/atomic-search-interface';

/**
 * @internal
 */
@Component({
  tag: 'atomic-follow-up-question-list',
  styleUrl: 'atomic-follow-up-question-list.pcss',
  shadow: true,
})
export class AtomicFollowUpQuestionList implements InitializableComponent {
  @InitializeBindings()
  public bindings!: Bindings;

  private searchBox!: SearchBox;

  private previousQuery: string = '';

  @BindStateToController('searchBox', {
    onUpdateCallbackMethod: 'onSearchBoxStateChange',
  })
  @State()
  private searchBoxState!: SearchBoxState;

  @State()
  public error!: Error;

  private defaultCandidates: FollowUpQuestionCandidate[] = [
    {
      question: 'What is Coveo?',
      score: 1.0,
    },
    {
      question: 'What is Coveo RGA?',
      score: 0.5,
    },
    {
      question: 'What is Smart Snippets?',
      score: 0.25,
    },
  ];

  @State()
  private candidates: FollowUpQuestionCandidate[] = [];

  public initialize() {
    this.searchBox = buildSearchBox(this.bindings.engine);
  }

  public render() {
    return (
      <follow-up-question-list-common
        candidates={this.candidates}
        onSelectCandidate={(
          evt: CustomEvent<SelectFollowUpQuestionCandidatePayload>
        ) => {
          this.onCandidateSelected(evt.detail.candidate);
        }}
      ></follow-up-question-list-common>
    );
  }

  private onCandidateSelected(candidate: FollowUpQuestionCandidate) {
    this.searchBox.updateText(candidate.question);
    this.searchBox.submit();
  }

  // @ts-expect-error: This function is used by BindStateToController.
  private onSearchBoxStateChange() {
    if (this.searchBoxState.value === this.previousQuery) {
      return;
    }

    this.previousQuery = this.searchBoxState.value;

    // The query has been updated.
    // 1. clear the existing questions.
    this.candidates = [];

    // 2. make an API call to fetch new follow-up questions
    // TODO: remove the mock and call the real API
    if (this.searchBoxState.value) {
      setTimeout(() => {
        this.candidates = this.defaultCandidates;
      }, 500);
    }
  }
}
