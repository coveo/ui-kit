import {
  MockSearchEngine,
  buildMockSearchAppEngine,
  createMockState,
} from '../../test';
import {setIsLoading, sseError, sseMessage} from './generated-answer-actions';

describe('generated answer', () => {
  let e: MockSearchEngine;

  beforeEach(() => {
    e = buildMockSearchAppEngine({state: createMockState()});
    jest.spyOn(e.apiClient, 'search');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('#sseMessage', () => {});

  describe('#sseError', () => {
    const actionType = 'generatedAnswer/sseError';

    it('should accept a full payload', () => {
      const testErrorPayload = {
        message: 'some message',
        code: 500,
      };
      expect(e.dispatch(sseError(testErrorPayload))).toEqual({
        payload: testErrorPayload,
        type: actionType,
      });
    });

    it('should accept a payload without a message', () => {
      const testErrorPayload = {
        code: 500,
      };
      expect(e.dispatch(sseError(testErrorPayload))).toEqual({
        payload: testErrorPayload,
        type: actionType,
      });
    });

    it('should accept a payload without a code', () => {
      const testErrorPayload = {
        message: 'some message',
      };
      expect(e.dispatch(sseError(testErrorPayload))).toEqual({
        payload: testErrorPayload,
        type: actionType,
      });
    });
  });

  describe('#setIsLoading', () => {
    const actionType = 'generatedAnswer/setIsLoading';

    it('should accept a boolean payload', () => {
      expect(e.dispatch(setIsLoading(true))).toEqual({
        payload: true,
        type: actionType,
      });
    });
  });

  describe('#sseMessage', () => {
    const actionType = 'generatedAnswer/sseMessage';

    it('should accept a string payload', () => {
      const testText = 'some message';
      expect(e.dispatch(sseMessage(testText))).toEqual({
        payload: testText,
        type: actionType,
      });
    });
  });
});
