import {beforeAll, describe, expect, it} from 'vitest';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {getAnswerAnnouncement, isSettledAnswer} from './answer-announcement';

describe('answer-announcement', () => {
  let i18n: Awaited<ReturnType<typeof createTestI18n>>;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const buildAnswer = (overrides = {}) => ({
    answer: '',
    cannotAnswer: false,
    isLoading: false,
    isStreaming: false,
    ...overrides,
  });

  describe('#getAnswerAnnouncement', () => {
    it('should stay silent when the answer is undefined', () => {
      expect(getAnswerAnnouncement(undefined, i18n)).toEqual({message: '', assertive: false});
    });

    it('should stay silent when the answer is empty and idle', () => {
      expect(getAnswerAnnouncement(buildAnswer(), i18n)).toEqual({message: '', assertive: false});
    });

    it('should stay silent when the answer contains only whitespace', () => {
      expect(getAnswerAnnouncement(buildAnswer({answer: '   \n  '}), i18n)).toEqual({
        message: '',
        assertive: false,
      });
    });

    it('should announce politely while streaming', () => {
      expect(getAnswerAnnouncement(buildAnswer({isStreaming: true}), i18n)).toEqual({
        message: 'Generating answer',
        assertive: false,
      });
    });

    it('should announce politely while loading', () => {
      expect(getAnswerAnnouncement(buildAnswer({isLoading: true}), i18n)).toEqual({
        message: 'Generating answer',
        assertive: false,
      });
    });

    it('should announce the answer as plain text once generation completes', () => {
      const announcement = getAnswerAnnouncement(
        buildAnswer({answer: '## Heading\n\nSome **bold** text.'}),
        i18n
      );

      expect(announcement.assertive).toBe(false);
      expect(announcement.message).toContain('Generated answer:');
      expect(announcement.message).toContain('Some bold text.');
      expect(announcement.message).not.toContain('**');
      expect(announcement.message).not.toContain('##');
    });

    it('should announce the generic error assertively', () => {
      expect(getAnswerAnnouncement(buildAnswer({error: {message: 'boom'}}), i18n)).toEqual({
        message: 'Something went wrong while generating the answer. Please try again later.',
        assertive: true,
      });
    });

    it('should announce the turn limit error assertively', () => {
      const answer = buildAnswer({
        error: {message: 'boom', isSseTurnLimitReachedError: () => true},
      });

      expect(getAnswerAnnouncement(answer, i18n)).toEqual({
        message: 'Conversation turn limit reached. Please start a new conversation.',
        assertive: true,
      });
    });

    it('should announce cannot-answer assertively', () => {
      const announcement = getAnswerAnnouncement(buildAnswer({cannotAnswer: true}), i18n);

      expect(announcement.assertive).toBe(true);
      expect(announcement.message).toContain("I couldn't find an answer to that.");
    });

    it('should prioritize the error over a partially streamed answer', () => {
      const announcement = getAnswerAnnouncement(
        buildAnswer({answer: 'partial', isStreaming: true, error: {message: 'boom'}}),
        i18n
      );

      expect(announcement.assertive).toBe(true);
      expect(announcement.message).toBe(
        'Something went wrong while generating the answer. Please try again later.'
      );
    });
  });

  describe('#isSettledAnswer', () => {
    it.each([
      {name: 'undefined', answer: undefined, expected: false},
      {name: 'a completed answer', answer: buildAnswer({answer: 'Done'}), expected: true},
      {
        name: 'a streaming answer',
        answer: buildAnswer({answer: 'Partial', isStreaming: true}),
        expected: false,
      },
      {
        name: 'a loading answer',
        answer: buildAnswer({answer: 'Partial', isLoading: true}),
        expected: false,
      },
      {
        name: 'an errored answer',
        answer: buildAnswer({answer: 'Partial', error: {message: 'boom'}}),
        expected: false,
      },
      {
        name: 'a cannot-answer state',
        answer: buildAnswer({cannotAnswer: true}),
        expected: false,
      },
      {name: 'an empty answer', answer: buildAnswer(), expected: false},
    ])('should return $expected for $name', ({answer, expected}) => {
      expect(isSettledAnswer(answer)).toBe(expected);
    });
  });
});
