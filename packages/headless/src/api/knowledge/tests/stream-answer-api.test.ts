/** biome-ignore-all lint/suspicious/noExplicitAny: Just tests */
import type {EventSourceMessage} from '../../../utils/fetch-event-source/parse.js';
import type {GeneratedAnswerStream} from '../generated-answer-stream.js';
import {
  buildAnswerEndpoint,
  updateCacheWithEvent,
} from '../stream-answer-api.js';

describe('#streamAnswerApi', () => {
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

  describe('buildAnswerEndpoint', () => {
    const baseUrl = 'https://api.coveo.com';
    const organizationId = 'test-org-123';
    const answerConfigurationId = 'answer-config-456';
    const insightId = 'insight-789';

    it('should throw when missing answerConfiguration', () => {
      expect(() => buildAnswerEndpoint(baseUrl, organizationId, '')).toThrow(
        'Missing required parameters for answer endpoint'
      );

      expect(() =>
        buildAnswerEndpoint(baseUrl, organizationId, undefined as any)
      ).toThrow('Missing required parameters for answer endpoint');
    });

    it('should build the proper endpoint when insightId is not provided', () => {
      const result = buildAnswerEndpoint(
        baseUrl,
        organizationId,
        answerConfigurationId
      );

      expect(result).toBe(
        `${baseUrl}/rest/organizations/${organizationId}/answer/v1/configs/${answerConfigurationId}/generate`
      );
    });

    it('should build the proper endpoint when insightId is provided', () => {
      const result = buildAnswerEndpoint(
        baseUrl,
        organizationId,
        answerConfigurationId,
        insightId
      );

      expect(result).toBe(
        `${baseUrl}/rest/organizations/${organizationId}/insight/v1/configs/${insightId}/answer/${answerConfigurationId}/generate`
      );
    });
  });
});
