import type {SearchAppState} from '../../state/search-app-state.js';
import type {
  FollowUpAnswersSection,
  GeneratedAnswerSection,
} from '../../state/state-sections.js';
import {buildMockCitation} from '../../test/mock-citation.js';
import {createInitialFollowUpAnswer} from '../follow-up-answers/follow-up-answers-state.js';
import {streamAnswerAPIStateMock} from './generated-answer-mocks.js';
import {
  citationSourceSelector,
  generativeQuestionAnsweringIdSelector,
  isGeneratedAnswerFeatureEnabledWithAgentAPI,
} from './generated-answer-selectors.js';

describe('generated-answer-selectors', () => {
  describe('generativeQuestionAnsweringIdSelector', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('returns the answerId if an answer configuration id is in state', () => {
      const mockWithExplicitAnswerId = {
        ...streamAnswerAPIStateMock,
        answer: {
          data: {},
        },
      };

      const state = {
        ...(mockWithExplicitAnswerId as Partial<SearchAppState>),
        generatedAnswer: {
          answerConfigurationId: 'config123',
          answerId: 'my-answer-id',
        },
      } as Partial<SearchAppState>;

      const result = generativeQuestionAnsweringIdSelector(state);
      expect(result).toEqual('my-answer-id');
    });

    it('returns the generativeQuestionAnsweringId if an answer configuration id is not in state', () => {
      const state = {
        ...(streamAnswerAPIStateMock as Partial<SearchAppState>),
        generatedAnswer: {
          answerConfigurationId: undefined,
        },
        search: {
          response: {
            extendedResults: {
              generativeQuestionAnsweringId:
                'generativeQuestionAnsweringId4321',
            },
          },
        },
      } as Partial<SearchAppState>;

      const result = generativeQuestionAnsweringIdSelector(state);
      expect(result).toEqual('generativeQuestionAnsweringId4321');
    });

    it('should handle states with missing search section', () => {
      const stateWithoutSearch = {
        ...(streamAnswerAPIStateMock as Partial<SearchAppState>),
        search: undefined,
        generatedAnswer: {
          answerConfigurationId: undefined,
        },
      } as Partial<SearchAppState>;

      const result = generativeQuestionAnsweringIdSelector(stateWithoutSearch);
      expect(result).toEqual(undefined);
    });

    it('should handle states with missing generatedAnswer section', () => {
      const stateWithoutGeneratedAnswer = {
        ...(streamAnswerAPIStateMock as Partial<SearchAppState>),
        generatedAnswer: undefined,
        search: {
          response: {
            extendedResults: {
              generativeQuestionAnsweringId: 'fromSearch123',
            },
          },
        },
      } as Partial<SearchAppState>;

      const result = generativeQuestionAnsweringIdSelector(
        stateWithoutGeneratedAnswer
      );
      expect(result).toEqual('fromSearch123');
    });

    it('should prioritize answerId over generativeQuestionAnsweringId when both exist', () => {
      const mockWithExplicitAnswerId = {
        ...streamAnswerAPIStateMock,
        answer: {
          data: {},
        },
      };

      const state = {
        ...(mockWithExplicitAnswerId as Partial<SearchAppState>),
        generatedAnswer: {
          answerConfigurationId: 'config123',
          answerId: 'my-answer-id',
        },
        search: {
          response: {
            extendedResults: {
              generativeQuestionAnsweringId: 'search123',
            },
          },
        },
      } as Partial<SearchAppState>;

      const result = generativeQuestionAnsweringIdSelector(state);
      expect(result).toBe('my-answer-id');
    });

    it('should return undefined when no relevant data is available', () => {
      const state = {
        configuration: {
          analytics: {enabled: true},
        },
        generatedAnswer: {
          answerConfigurationId: undefined,
        },
        search: {
          response: {
            // N/A
          },
        },
      } as Partial<SearchAppState>;

      const result = generativeQuestionAnsweringIdSelector(state);
      expect(result).toEqual(undefined);
    });
  });

  describe('isGeneratedAnswerFeatureEnabledWithAgentAPI', () => {
    it('should return true when generatedAnswer and valid agentId are present', () => {
      const state = {
        generatedAnswer: {},
        configuration: {
          knowledge: {
            agentId: 'valid-agent-id',
          },
        },
      } as unknown as Partial<SearchAppState>;

      expect(isGeneratedAnswerFeatureEnabledWithAgentAPI(state)).toBe(true);
    });

    it('should return false when generatedAnswer is missing', () => {
      const state = {
        configuration: {
          knowledge: {
            agentId: 'valid-agent-id',
          },
        },
      } as unknown as Partial<SearchAppState>;

      expect(isGeneratedAnswerFeatureEnabledWithAgentAPI(state)).toBe(false);
    });

    it('should return false when agentId is undefined', () => {
      const state = {
        generatedAnswer: {},
        configuration: {
          knowledge: {},
        },
      } as unknown as Partial<SearchAppState>;

      expect(isGeneratedAnswerFeatureEnabledWithAgentAPI(state)).toBe(false);
    });

    it('should return false when agentId is an empty string', () => {
      const state = {
        generatedAnswer: {},
        configuration: {
          knowledge: {
            agentId: '',
          },
        },
      } as unknown as Partial<SearchAppState>;

      expect(isGeneratedAnswerFeatureEnabledWithAgentAPI(state)).toBe(false);
    });

    it('should return false when agentId is only whitespace', () => {
      const state = {
        generatedAnswer: {},
        configuration: {
          knowledge: {
            agentId: '   ',
          },
        },
      } as unknown as Partial<SearchAppState>;

      expect(isGeneratedAnswerFeatureEnabledWithAgentAPI(state)).toBe(false);
    });
  });

  describe('citationSourceSelector', () => {
    const headCitation = buildMockCitation({
      id: 'head-citation-1',
      permanentid: 'head-perm-1',
      title: 'Head Citation',
      uri: 'https://example.com/head',
      clickUri: 'https://example.com/head',
    });

    const followUpCitation = buildMockCitation({
      id: 'followup-citation-1',
      permanentid: 'followup-perm-1',
      title: 'Follow-up Citation',
      uri: 'https://example.com/followup',
      clickUri: 'https://example.com/followup',
    });

    it('finds a citation in head answer citations', () => {
      const state = {
        generatedAnswer: {citations: [headCitation]},
      } as unknown as Partial<GeneratedAnswerSection & FollowUpAnswersSection>;

      const result = citationSourceSelector(state, 'head-citation-1');
      expect(result).toEqual(headCitation);
    });

    it('finds a citation in follow-up answer citations', () => {
      const state = {
        generatedAnswer: {citations: [headCitation]},
        followUpAnswers: {
          followUpAnswers: [
            {
              ...createInitialFollowUpAnswer('follow up question'),
              answerId: 'followup-answer-1',
              citations: [followUpCitation],
            },
          ],
        },
      } as unknown as Partial<GeneratedAnswerSection & FollowUpAnswersSection>;

      const result = citationSourceSelector(state, 'followup-citation-1');
      expect(result).toEqual(followUpCitation);
    });

    it('prioritizes head answer citations over follow-up citations with the same id', () => {
      const duplicateCitation = buildMockCitation({
        id: 'shared-id',
        title: 'Follow-up version',
      });
      const headVersion = buildMockCitation({
        id: 'shared-id',
        title: 'Head version',
      });

      const state = {
        generatedAnswer: {citations: [headVersion]},
        followUpAnswers: {
          followUpAnswers: [
            {
              ...createInitialFollowUpAnswer('follow up'),
              answerId: 'followup-1',
              citations: [duplicateCitation],
            },
          ],
        },
      } as unknown as Partial<GeneratedAnswerSection & FollowUpAnswersSection>;

      const result = citationSourceSelector(state, 'shared-id');
      expect(result?.title).toBe('Head version');
    });

    it('returns undefined when citation is not found anywhere', () => {
      const state = {
        generatedAnswer: {citations: [headCitation]},
        followUpAnswers: {
          followUpAnswers: [
            {
              ...createInitialFollowUpAnswer('follow up'),
              answerId: 'followup-1',
              citations: [followUpCitation],
            },
          ],
        },
      } as unknown as Partial<GeneratedAnswerSection & FollowUpAnswersSection>;

      const result = citationSourceSelector(state, 'nonexistent-id');
      expect(result).toBeUndefined();
    });

    it('works when followUpAnswers is not present in state', () => {
      const state = {
        generatedAnswer: {citations: [headCitation]},
      } as unknown as Partial<GeneratedAnswerSection & FollowUpAnswersSection>;

      const result = citationSourceSelector(state, 'head-citation-1');
      expect(result).toEqual(headCitation);
    });

    it('finds a citation across multiple follow-up answers', () => {
      const secondFollowUpCitation = buildMockCitation({
        id: 'followup-citation-2',
        title: 'Second Follow-up Citation',
      });

      const state = {
        generatedAnswer: {citations: []},
        followUpAnswers: {
          followUpAnswers: [
            {
              ...createInitialFollowUpAnswer('first follow up'),
              answerId: 'followup-1',
              citations: [followUpCitation],
            },
            {
              ...createInitialFollowUpAnswer('second follow up'),
              answerId: 'followup-2',
              citations: [secondFollowUpCitation],
            },
          ],
        },
      } as unknown as Partial<GeneratedAnswerSection & FollowUpAnswersSection>;

      const result = citationSourceSelector(state, 'followup-citation-2');
      expect(result).toEqual(secondFollowUpCitation);
    });
  });
});
