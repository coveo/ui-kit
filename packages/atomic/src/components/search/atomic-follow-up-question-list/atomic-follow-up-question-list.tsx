import {
  buildSearchBox,
  getOrganizationEndpoint,
  SearchBox,
  SearchBoxState,
} from '@coveo/headless';
import {Component, h, Prop, State} from '@stencil/core';
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

  private previousQuery: string | undefined;

  /**
   * @internal
   * The unique identifier of the answer configuration to use to generate the answer.
   */
  @Prop()
  public answerConfigurationId!: string;

  @BindStateToController('searchBox', {
    onUpdateCallbackMethod: 'onSearchBoxStateChange',
  })
  @State()
  private searchBoxState!: SearchBoxState;

  @State()
  public error!: Error;

  @State()
  private candidates: FollowUpQuestionCandidate[] = [];

  public initialize() {
    this.searchBox = buildSearchBox(this.bindings.engine);
  }

  public render() {
    return (
      <follow-up-question-list-common
        i18n={this.bindings.i18n}
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
    const currentQuery = this.searchBoxState?.value;

    if (currentQuery === this.previousQuery) {
      return;
    }

    this.previousQuery = currentQuery;

    // The query has been updated. Clear the existing questions.
    this.candidates = [];

    if (this.answerConfigurationId && currentQuery !== undefined) {
      const {accessToken, organizationId, environment} =
        this.bindings.engine.state.configuration;
      const orgEndpoint = getOrganizationEndpoint(organizationId, environment);

      fetch(
        `${orgEndpoint}/rest/organizations/${organizationId}/answer/v1/configs/${encodeURIComponent(this.answerConfigurationId)}/followup`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            semanticQuery: currentQuery,
            numberOfCandidates: 3,
          }),
        }
      )
        .then((response) => response.json())
        .then(({candidates}: {candidates: FollowUpQuestionCandidate[]}) => {
          this.candidates = candidates;
        })
        .catch((error) => {
          console.warn('Failed to retrieve follow-up questions', error);
        });
    }
  }
}
