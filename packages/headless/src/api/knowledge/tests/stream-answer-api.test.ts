/** biome-ignore-all lint/suspicious/noExplicitAny: Just tests */
import {buildMockNavigatorContextProvider} from '../../../test/mock-navigator-context-provider.js';
import type {EventSourceMessage} from '../../../utils/fetch-event-source/parse.js';
import {
  constructAnswerQueryParams,
  type GeneratedAnswerStream,
  updateCacheWithEvent,
} from '../stream-answer-api.js';
import {
  expectedStreamAnswerAPIParam,
  expectedStreamAnswerAPIParamForSelect,
  expectedStreamAnswerAPIParamWithATabWithAnExpression,
  expectedStreamAnswerAPIParamWithoutAnyTab,
  expectedStreamAnswerAPIParamWithoutSearchAction,
  expectedStreamAnswerAPIParamWithStaticFiltersAndTabExpression,
  expectedStreamAnswerAPIParamWithStaticFiltersAndTabExpressionWithoutAdvancedCQ,
  expectedStreamAnswerAPIParamWithStaticFiltersSelected,
  streamAnswerAPIStateMock,
  streamAnswerAPIStateMockWithATabWithAnExpression,
  streamAnswerAPIStateMockWithNonValidFilters,
  streamAnswerAPIStateMockWithoutAnyFilters,
  streamAnswerAPIStateMockWithoutAnyTab,
  streamAnswerAPIStateMockWithoutSearchAction,
  streamAnswerAPIStateMockWithStaticFiltersAndTabExpression,
  streamAnswerAPIStateMockWithStaticFiltersAndTabExpressionWithEmptyCQ,
  streamAnswerAPIStateMockWithStaticFiltersSelected,
} from './stream-answer-api-state-mock.js';

describe('#streamAnswerApi', () => {
  describe('constructAnswerQueryParams', () => {
    beforeEach(() => {
      vi.useFakeTimers().setSystemTime(new Date('2020-01-01'));
    });
    afterAll(() => {
      vi.useRealTimers();
    });

    it('returns the correct query params with fetch usage', () => {
      const queryParams = constructAnswerQueryParams(
        streamAnswerAPIStateMock as any,
        'fetch',
        buildMockNavigatorContextProvider()()
      );

      expect(queryParams).toEqual(expectedStreamAnswerAPIParam);
    });

    it('should create the right selector when usage is select', () => {
      const queryParams = constructAnswerQueryParams(
        streamAnswerAPIStateMock as any,
        'select',
        buildMockNavigatorContextProvider()()
      );

      expect(queryParams).toEqual(expectedStreamAnswerAPIParamForSelect);
    });

    it('should merge tab expression in request constant query when expression is not a blank string', () => {
      const queryParams = constructAnswerQueryParams(
        streamAnswerAPIStateMockWithATabWithAnExpression as any,
        'fetch',
        buildMockNavigatorContextProvider()()
      );

      expect(queryParams).toEqual(
        expectedStreamAnswerAPIParamWithATabWithAnExpression
      );
    });

    it('should not include tab info when there is NO tab', () => {
      const queryParams = constructAnswerQueryParams(
        streamAnswerAPIStateMockWithoutAnyTab as any,
        'fetch',
        buildMockNavigatorContextProvider()()
      );

      expect(queryParams).toEqual(expectedStreamAnswerAPIParamWithoutAnyTab);
    });

    it('should merge filter expressions in request constant query when expression is selected', () => {
      const queryParams = constructAnswerQueryParams(
        streamAnswerAPIStateMockWithStaticFiltersSelected as any,
        'fetch',
        buildMockNavigatorContextProvider()()
      );

      expect(queryParams).toEqual(
        expectedStreamAnswerAPIParamWithStaticFiltersSelected
      );
    });

    it('should not include filter info when there is NO filter', () => {
      const queryParams = constructAnswerQueryParams(
        streamAnswerAPIStateMockWithoutAnyFilters as any,
        'fetch',
        buildMockNavigatorContextProvider()()
      );
      expect(queryParams).toEqual(expectedStreamAnswerAPIParam);
    });

    it('should not include non-selected filters and empty filters', () => {
      const queryParams = constructAnswerQueryParams(
        streamAnswerAPIStateMockWithNonValidFilters as any,
        'fetch',
        buildMockNavigatorContextProvider()()
      );
      expect(queryParams).toEqual(expectedStreamAnswerAPIParam);
    });

    it('should merge multiple filter expressions and a tab expression', () => {
      const queryParams = constructAnswerQueryParams(
        streamAnswerAPIStateMockWithStaticFiltersAndTabExpression as any,
        'fetch',
        buildMockNavigatorContextProvider()()
      );
      expect(queryParams).toEqual(
        expectedStreamAnswerAPIParamWithStaticFiltersAndTabExpression
      );
    });

    it('should not include advanced search queries when there are no advanced search queries', () => {
      const queryParams = constructAnswerQueryParams(
        streamAnswerAPIStateMockWithStaticFiltersAndTabExpressionWithEmptyCQ as any,
        'fetch',
        buildMockNavigatorContextProvider()()
      );
      expect(queryParams).toEqual(
        expectedStreamAnswerAPIParamWithStaticFiltersAndTabExpressionWithoutAdvancedCQ
      );
    });

    it('should accept an undefined SearchAction', () => {
      const queryParams = constructAnswerQueryParams(
        streamAnswerAPIStateMockWithoutSearchAction as any,
        'fetch',
        buildMockNavigatorContextProvider()()
      );

      expect(queryParams).toEqual(
        expectedStreamAnswerAPIParamWithoutSearchAction
      );
    });

    it('should exclude analytics fields when usage is select', () => {
      const queryParams = constructAnswerQueryParams(
        streamAnswerAPIStateMock as any,
        'select',
        buildMockNavigatorContextProvider()()
      );

      // Verify that volatile fields (clientTimestamp, actionCause) are not present
      expect(queryParams.analytics).toBeUndefined();
    });

    it('should include all analytics fields when usage is fetch', () => {
      const queryParams = constructAnswerQueryParams(
        streamAnswerAPIStateMock as any,
        'fetch',
        buildMockNavigatorContextProvider()()
      );

      // Verify that all analytics fields are present including volatile ones
      expect(queryParams.analytics).toBeDefined();
      expect(queryParams.analytics?.clientTimestamp).toBeDefined();
      expect(queryParams.analytics?.actionCause).toBeDefined();
      expect(queryParams.analytics?.capture).toBeDefined();
      expect(queryParams.analytics?.clientId).toBeDefined();
      expect(queryParams.analytics?.originContext).toBeDefined();
    });
  });

  describe('updateCacheWithEvent', () => {
    const buildEvent = (data: Record<string, any>): EventSourceMessage => {
      return {
        id: '001',
        event: 'test',
        data: JSON.stringify(data),
      };
    };

    const buildSuccessEvent = (data: {
      payloadType: string;
      payload: Record<string, any>;
    }): EventSourceMessage => {
      return {
        id: '001',
        event: 'test',
        data: JSON.stringify(
          Object.assign(
            {
              payloadType: data.payloadType,
              payload: JSON.stringify(data.payload),
            },
            {
              finishReason: 'success',
              errorMessage: '',
              code: 200,
            }
          )
        ),
      };
    };

    const buildDefaultDraft = (
      draft: Record<string, any> = {}
    ): GeneratedAnswerStream =>
      Object.assign(
        {...draft},
        {
          isLoading: false,
          isStreaming: false,
        }
      );

    it('should handle the error when finishReason is ERROR', () => {
      const dispatch = vi.fn();
      const event: EventSourceMessage = buildEvent({
        finishReason: 'ERROR',
        errorMessage: 'some error',
        code: 500,
        payload: '',
        payloadType: 'genqa.messageType',
      });

      const draft = buildDefaultDraft();

      updateCacheWithEvent(event, draft, dispatch);

      expect(draft).toHaveProperty('error', {
        message: 'some error',
        code: 500,
      });
      expect(draft).toHaveProperty('isStreaming', false);
      expect(draft).toHaveProperty('isLoading', false);
    });

    it('should handle header message type', () => {
      const dispatch = vi.fn();
      const event = buildSuccessEvent({
        payloadType: 'genqa.headerMessageType',
        payload: {contentFormat: 'text/markdown'},
      });
      const draft = buildDefaultDraft();

      updateCacheWithEvent(event, draft, dispatch);

      expect(draft).toHaveProperty('contentFormat', 'text/markdown');
      expect(draft).toHaveProperty('isStreaming', true);
      expect(draft).toHaveProperty('isLoading', false);
      expect(dispatch).toHaveBeenCalledWith({
        type: 'generatedAnswer/setAnswerContentFormat',
        payload: 'text/markdown',
      });
    });

    it('should handle the message type', () => {
      const dispatch = vi.fn();
      const event = buildSuccessEvent({
        payloadType: 'genqa.messageType',
        payload: {
          textDelta: 'some answer',
        },
      });
      const draft = buildDefaultDraft({answer: undefined});

      updateCacheWithEvent(event, draft, dispatch);

      expect(draft).toHaveProperty('answer', 'some answer');
      expect(dispatch).toHaveBeenCalledWith({
        type: 'generatedAnswer/updateMessage',
        payload: {
          textDelta: 'some answer',
        },
      });
    });

    it('should handle message type and append answer', () => {
      const dispatch = vi.fn();
      const event = buildSuccessEvent({
        payloadType: 'genqa.messageType',
        payload: {
          textDelta: 'with some more info',
        },
      });
      const draft = buildDefaultDraft({answer: 'some answer '});

      updateCacheWithEvent(event, draft, dispatch);

      expect(draft).toHaveProperty('answer', 'some answer with some more info');
      expect(dispatch).toHaveBeenCalledWith({
        type: 'generatedAnswer/updateMessage',
        payload: {
          textDelta: 'with some more info',
        },
      });
    });

    it('should handle citations message', () => {
      const dispatch = vi.fn();
      const citation = {
        id: '1',
        permanentid: '1',
        source: 'source',
        title: 'some title',
        uri: 'some uri',
      };
      const event = buildSuccessEvent({
        payloadType: 'genqa.citationsType',
        payload: {
          citations: [citation],
        },
      });
      const draft = buildDefaultDraft();

      updateCacheWithEvent(event, draft, dispatch);

      expect(draft).toHaveProperty('citations', [citation]);
      expect(dispatch).toHaveBeenCalledWith({
        type: 'generatedAnswer/updateCitations',
        payload: {
          citations: [citation],
        },
      });
    });

    it('should handle end of stream message when answer is generated', () => {
      const dispatch = vi.fn();
      const event = buildSuccessEvent({
        payloadType: 'genqa.endOfStreamType',
        payload: {
          answerGenerated: true,
        },
      });
      const draft = buildDefaultDraft({answer: 'some answer'});

      updateCacheWithEvent(event, draft, dispatch);

      expect(draft).toHaveProperty('generated', true);
      expect(draft).toHaveProperty('isStreaming', false);
      expect(dispatch).toHaveBeenCalled();
    });

    it('should handle end of stream message when answer is not generated', () => {
      const dispatch = vi.fn();
      const event = buildSuccessEvent({
        payloadType: 'genqa.endOfStreamType',
        payload: {
          answerGenerated: false,
        },
      });
      const draft = buildDefaultDraft();

      updateCacheWithEvent(event, draft, dispatch);

      expect(draft).toHaveProperty('generated', false);
      expect(draft).toHaveProperty('isStreaming', false);
      expect(dispatch).toHaveBeenCalled();
    });
  });
});
