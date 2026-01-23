import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import type {GeneratedAnswerServerState} from '../../answer-generation-api-state.js';
import type {Message, StreamPayload} from '../types.js';
import {
  endStreaming,
  initializeStreamingAnswer,
  setAnswer,
  setAnswerError,
  setAnswerId,
  setCitations,
} from './answer-draft-reducer.js';

describe('answer draft handlers', () => {
  let draft: GeneratedAnswerServerState;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    draft = {
      isStreaming: false,
      isLoading: true,
    } as GeneratedAnswerServerState;

    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('#setAnswerId', () => {
    it('should set answerId when provided', () => {
      const answerId = 'test-answer-id-123';

      setAnswerId(draft, answerId);

      expect(draft.answerId).toBe(answerId);
    });

    it('should not set answerId when empty string is provided', () => {
      setAnswerId(draft, '');

      expect(draft.answerId).toBeUndefined();
    });
  });

  describe('#initializeStreamingAnswer', () => {
    it('should set contentFormat and update streaming and loading flags', () => {
      const payload = {
        contentFormat: 'text/markdown' as const,
      };

      initializeStreamingAnswer(draft, payload);

      expect(draft.contentFormat).toBe('text/markdown');
      expect(draft.isStreaming).toBe(true);
      expect(draft.isLoading).toBe(false);
    });
  });

  describe('#setAnswer', () => {
    it('should set answer when draft.answer is undefined', () => {
      const payload: Pick<StreamPayload, 'textDelta'> = {
        textDelta: 'First chunk',
      };

      setAnswer(draft, payload);

      expect(draft.answer).toBe('First chunk');
    });

    it('should concatenate textDelta to existing answer', () => {
      draft.answer = 'Initial text';
      const payload: Pick<StreamPayload, 'textDelta'> = {
        textDelta: ' additional text',
      };

      setAnswer(draft, payload);

      expect(draft.answer).toBe('Initial text additional text');
    });

    it('should handle multiple consecutive messages', () => {
      setAnswer(draft, {textDelta: 'First '});
      setAnswer(draft, {textDelta: 'second '});
      setAnswer(draft, {textDelta: 'third'});

      expect(draft.answer).toBe('First second third');
    });

    it('should not modify answer when textDelta is undefined', () => {
      draft.answer = 'Existing answer';
      const payload: Pick<StreamPayload, 'textDelta'> = {
        textDelta: undefined,
      };

      setAnswer(draft, payload);

      expect(draft.answer).toBe('Existing answer');
    });

    it('should handle empty string textDelta', () => {
      draft.answer = 'Test';
      const payload: Pick<StreamPayload, 'textDelta'> = {
        textDelta: '',
      };

      setAnswer(draft, payload);

      expect(draft.answer).toBe('Test');
    });
  });

  describe('#setCitations', () => {
    it('should set citations', () => {
      const citations = [
        {
          id: 'citation-1',
          title: 'Test Citation 1',
          uri: 'https://example.com/1',
          source: 'Example Source',
          permanentid: 'perm-1',
          clickUri: 'https://example.com/click/1',
        },
        {
          id: 'citation-2',
          title: 'Test Citation 2',
          uri: 'https://example.com/2',
          source: 'Example Source',
          permanentid: 'perm-2',
          clickUri: 'https://example.com/click/2',
        },
      ];
      const payload: Pick<StreamPayload, 'citations'> = {citations};

      setCitations(draft, payload);

      expect(draft.citations).toEqual(citations);
    });

    it('should handle empty citations array', () => {
      const payload: Pick<StreamPayload, 'citations'> = {citations: []};

      setCitations(draft, payload);

      expect(draft.citations).toEqual([]);
    });

    it('should replace existing citations', () => {
      draft.citations = [
        {
          id: 'old-citation',
          title: 'Old',
          uri: 'https://old.com',
          source: 'Old Example Source',
          permanentid: 'old',
          clickUri: 'https://old.com/click',
        },
      ];
      const newCitations = [
        {
          id: 'new-citation',
          title: 'New',
          uri: 'https://new.com',
          source: 'New Example Source',
          permanentid: 'new',
          clickUri: 'https://new.com/click',
        },
      ];
      const payload: Pick<StreamPayload, 'citations'> = {
        citations: newCitations,
      };

      setCitations(draft, payload);

      expect(draft.citations).toEqual(newCitations);
    });
  });

  describe('#endStreaming', () => {
    it('should set generated to true and stop streaming', () => {
      draft.isStreaming = true;
      const payload: Pick<StreamPayload, 'answerGenerated'> = {
        answerGenerated: true,
      };

      endStreaming(draft, payload);

      expect(draft.generated).toBe(true);
      expect(draft.isStreaming).toBe(false);
    });

    it('should set generated to false when answerGenerated is false', () => {
      draft.isStreaming = true;
      const payload: Pick<StreamPayload, 'answerGenerated'> = {
        answerGenerated: false,
      };

      endStreaming(draft, payload);

      expect(draft.generated).toBe(false);
      expect(draft.isStreaming).toBe(false);
    });

    it('should handle undefined answerGenerated', () => {
      draft.isStreaming = true;
      const payload: Pick<StreamPayload, 'answerGenerated'> = {
        answerGenerated: undefined,
      };

      endStreaming(draft, payload);

      expect(draft.generated).toBeUndefined();
      expect(draft.isStreaming).toBe(false);
    });
  });

  describe('#setAnswerError', () => {
    it('should set error with message and code', () => {
      const message: Message = {
        payloadType: 'genqa.messageType',
        payload: '',
        finishReason: 'ERROR',
        errorMessage: 'Test error message',
        code: 500,
      };

      setAnswerError(draft, message);

      expect(draft.error).toEqual({
        message: 'Test error message',
        code: 500,
      });
      expect(draft.isStreaming).toBe(false);
      expect(draft.isLoading).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Generated answer error: Test error message (code: 500)'
      );
    });

    it('should use default error message when errorMessage is empty', () => {
      const message: Message = {
        payloadType: 'genqa.messageType',
        payload: '',
        finishReason: 'ERROR',
        code: 400,
      };

      setAnswerError(draft, message);

      expect(draft.error).toEqual({
        message: 'Unknown error occurred',
        code: 400,
      });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Generated answer error: Unknown error occurred (code: 400)'
      );
    });

    it('should stop streaming and loading on error', () => {
      draft.isStreaming = true;
      draft.isLoading = true;
      const message: Message = {
        payloadType: 'genqa.messageType',
        payload: '',
        finishReason: 'ERROR',
        errorMessage: 'Test error message',
        code: 500,
      };

      setAnswerError(draft, message);

      expect(draft.isStreaming).toBe(false);
      expect(draft.isLoading).toBe(false);
    });
  });
});
