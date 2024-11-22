import {Component, Event, EventEmitter, h, Prop} from '@stencil/core';

export interface FollowUpQuestionCandidate {
  question: string;
  score: number;
}

export interface SelectFollowUpQuestionCandidatePayload {
  candidate: FollowUpQuestionCandidate;
}

/**
 * @internal
 */
@Component({
  tag: 'follow-up-question-list-common',
  styleUrl: 'follow-up-question-list-common.pcss',
})
export class FollowUpQuestionListCommon {
  @Prop() public candidates: FollowUpQuestionCandidate[] = [];
  @Event({eventName: 'selectCandidate'})
  public selectCandidate!: EventEmitter<SelectFollowUpQuestionCandidatePayload>;

  public render() {
    if (this.candidates.length === 0) {
      return null;
    }

    return (
      <div part="follow-up-question-list">
        {this.candidates.map((candidate) => (
          <atomic-follow-up-question
            question={candidate.question}
            onSelect={() => this.selectCandidate.emit({candidate})}
          ></atomic-follow-up-question>
        ))}
      </div>
    );
  }
}
