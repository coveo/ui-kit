import {skipToken} from '@reduxjs/toolkit/query';
import {describe, expect, it} from 'vitest';
import type {SearchAppState} from '../../state/search-app-state.js';
import {selectAnswerApiQueryParams} from './answer-api-selectors.js';

const buildState = (overrides: Partial<SearchAppState> = {}): SearchAppState =>
  ({
    configuration: {
      analytics: {analyticsMode: 'legacy', enabled: true},
      ...(overrides.configuration || {}),
    },
    query: {q: 'what is coveo', ...(overrides.query || {})},
    search: {
      requestId: 'req-1',
      searchAction: {actionCause: 'searchboxSubmit'},
      ...(overrides.search || {}),
    },
    generatedAnswer: {
      cannotAnswer: false,
      answerApiQueryParams: undefined,
      ...(overrides.generatedAnswer || {}),
    },
    ...overrides,
  }) as unknown as SearchAppState;

describe('answer-api-selectors', () => {
  describe('selectAnswerApiQueryParams', () => {
    it('returns skipToken when answerApiQueryParams is undefined', () => {
      const state = buildState();
      const result = selectAnswerApiQueryParams(state as SearchAppState);
      expect(result).toBe(skipToken);
    });

    it('returns stored answerApiQueryParams when defined', () => {
      const answerApiQueryParams = {
        q: 'abc',
        pipelineRuleParameters: {
          mlGenerativeQuestionAnswering: {
            responseFormat: {contentFormat: ['text/plain']},
            citationsFieldToInclude: [],
          },
        },
      };
      const state = buildState({
        generatedAnswer: {
          cannotAnswer: false,
          answerApiQueryParams,
        },
      });
      const result = selectAnswerApiQueryParams(state as SearchAppState);
      expect(result).toBe(answerApiQueryParams);
    });
  });
});
