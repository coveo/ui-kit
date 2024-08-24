/* eslint-disable @typescript-eslint/no-explicit-any */
import {constructAnswerQueryParams} from '../stream-answer-api';
import {
  expectedStreamAnswerAPIParam,
  streamAnswerAPIStateMock,
} from './stream-answer-api-state-mock';

describe('#streamAnswerApi', () => {
  describe('constructAnswerQueryParams', () => {
    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));
    });
    afterAll(() => {
      jest.useRealTimers();
    });
    it('returns the correct query params with fetch usage', () => {
      const queryParams = constructAnswerQueryParams(
        streamAnswerAPIStateMock as any,
        'fetch'
      );

      expect(queryParams).toEqual(expectedStreamAnswerAPIParam);
    });

    it('will create the right selector with select usage', () => {
      constructAnswerQueryParams(streamAnswerAPIStateMock as any, 'select');

      jest.useFakeTimers().setSystemTime(new Date('2024-01-01'));
      const queryParams = constructAnswerQueryParams(
        streamAnswerAPIStateMock as any,
        'select'
      );

      expect(queryParams).toEqual(expectedStreamAnswerAPIParam);
    });
  });
});
