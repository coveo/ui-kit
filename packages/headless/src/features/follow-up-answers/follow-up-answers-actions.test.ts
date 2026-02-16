import {beforeEach, describe, expect, it, vi} from 'vitest';
import {initiateFollowUpEndpoint} from '../../api/knowledge/answer-generation/endpoints/follow-up/follow-up-endpoint.js';
import {selectAgentId} from '../configuration/configuration-selectors.js';
import {
  constructGenerateFollowUpAnswerParams,
  type StateNeededForFollowUpAnswerParams,
} from './follow-up-answer-request.js';
import {generateFollowUpAnswer} from './follow-up-answers-actions.js';

vi.mock('../configuration/configuration-selectors.js', () => ({
  selectAgentId: vi.fn(),
}));

vi.mock('./follow-up-answer-request.js', () => ({
  constructGenerateFollowUpAnswerParams: vi.fn(),
}));

vi.mock(
  '../../api/knowledge/answer-generation/endpoints/follow-up/follow-up-endpoint.js',
  () => ({
    initiateFollowUpEndpoint: vi.fn(() => ({
      type: 'mocked/initiateFollowUpEndpoint',
    })),
  })
);

describe('generateFollowUpAnswer', () => {
  const question = 'What is the next step?';
  const mockDispatch = vi.fn().mockImplementation((action) => action);
  const mockLogger = {warn: vi.fn()};
  // biome-ignore lint/suspicious/noExplicitAny: test fixture only needs logger
  const extra = {logger: mockLogger} as any;
  const state = {
    followUpAnswers: {conversationId: 'conv-id'},
  };
  const getState = vi.fn(() => state as StateNeededForFollowUpAnswerParams);

  beforeEach(() => {
    vi.clearAllMocks();
    mockDispatch.mockClear();
    getState.mockClear();
    mockLogger.warn.mockReset();

    vi.mocked(selectAgentId).mockReturnValue('agent-id');
    vi.mocked(constructGenerateFollowUpAnswerParams).mockReturnValue({
      q: question,
      conversationId: 'conv-id',
    });
  });

  it('should dispatch follow-up creation and initiate the endpoint when agentId exists', async () => {
    const thunk = generateFollowUpAnswer(question);
    await thunk(mockDispatch, getState, extra);

    expect(selectAgentId).toHaveBeenCalledWith(state);
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'followUpAnswers/createFollowUpAnswer',
        payload: {question},
      })
    );
    expect(constructGenerateFollowUpAnswerParams).toHaveBeenCalledWith(
      question,
      state
    );
    expect(initiateFollowUpEndpoint).toHaveBeenCalledWith({
      strategyKey: 'follow-up-answer',
      q: question,
      conversationId: 'conv-id',
    });
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({type: 'mocked/initiateFollowUpEndpoint'})
    );
    expect(mockLogger.warn).not.toHaveBeenCalled();
  });

  it('should warn and avoid dispatching follow-up actions when agentId is missing', async () => {
    vi.mocked(selectAgentId).mockReturnValue(undefined);

    const thunk = generateFollowUpAnswer(question);
    await thunk(mockDispatch, getState, extra);

    expect(mockLogger.warn).toHaveBeenCalledWith(
      'Missing agentId in engine configuration. ' +
        'The generateFollowUpAnswer action requires an agent ID.'
    );
    expect(mockDispatch).not.toHaveBeenCalledWith(
      expect.objectContaining({type: 'followUpAnswers/createFollowUpAnswer'})
    );
    expect(initiateFollowUpEndpoint).not.toHaveBeenCalled();
    expect(constructGenerateFollowUpAnswerParams).not.toHaveBeenCalled();
  });

  it('should warn and avoid dispatching follow-up actions when agentId is an empty string', async () => {
    vi.mocked(selectAgentId).mockReturnValue(' ');

    const thunk = generateFollowUpAnswer(question);
    await thunk(mockDispatch, getState, extra);

    expect(mockLogger.warn).toHaveBeenCalledWith(
      'Missing agentId in engine configuration. ' +
        'The generateFollowUpAnswer action requires an agent ID.'
    );
    expect(mockDispatch).not.toHaveBeenCalledWith(
      expect.objectContaining({type: 'followUpAnswers/createFollowUpAnswer'})
    );
    expect(initiateFollowUpEndpoint).not.toHaveBeenCalled();
    expect(constructGenerateFollowUpAnswerParams).not.toHaveBeenCalled();
  });
});
