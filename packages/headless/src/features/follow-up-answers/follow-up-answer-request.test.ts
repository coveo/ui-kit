import {describe, expect, it} from 'vitest';
import {getConfigurationInitialState} from '../configuration/configuration-state.js';
import {
  constructGenerateFollowUpAnswerParams,
  type StateNeededForFollowUpAnswerParams,
} from './follow-up-answer-request.js';
import {getFollowUpAnswersInitialState} from './follow-up-answers-state.js';

const buildState = (
  conversationId?: string
): StateNeededForFollowUpAnswerParams => ({
  configuration: getConfigurationInitialState(),
  followUpAnswers: {
    ...getFollowUpAnswersInitialState(),
    conversationId: conversationId ?? '',
  },
});

describe('constructGenerateFollowUpAnswerParams', () => {
  it('should return the provided question with the current conversation id', () => {
    const params = constructGenerateFollowUpAnswerParams(
      'Follow-up?',
      buildState('conv-id-123')
    );

    expect(params).toEqual({
      conversationId: 'conv-id-123',
      q: 'Follow-up?',
    });
  });

  it('should return an empty conversation id when none is available', () => {
    const params = constructGenerateFollowUpAnswerParams(
      'Follow-up?',
      buildState(undefined)
    );

    expect(params).toEqual({conversationId: '', q: 'Follow-up?'});
  });
});
