import type {Activity} from '@coveo/thermidor';
import {describe, expect, it} from 'vitest';
import {FOLLOW_UP_QUESTIONS_KIND, followUpQuestionsIn} from './follow-up-questions.js';

const activity = (kind: string, payload: Record<string, unknown>): Activity => ({
  id: '',
  kind,
  replace: false,
  payload,
});

describe('followUpQuestionsIn', () => {
  it('reads the text of each question, in order', () => {
    const activities = [
      activity(FOLLOW_UP_QUESTIONS_KIND, {questions: [{text: 'First?'}, {text: 'Second?'}]}),
    ];

    expect(followUpQuestionsIn(activities)).toEqual(['First?', 'Second?']);
  });

  it('keeps questions that carry fields it does not know', () => {
    const activities = [
      activity(FOLLOW_UP_QUESTIONS_KIND, {questions: [{text: 'First?', id: 'q1'}], other: 1}),
    ];

    expect(followUpQuestionsIn(activities)).toEqual(['First?']);
  });

  it('reads the latest follow-up questions when there are several', () => {
    const activities = [
      activity(FOLLOW_UP_QUESTIONS_KIND, {questions: [{text: 'Old?'}]}),
      activity(FOLLOW_UP_QUESTIONS_KIND, {questions: [{text: 'New?'}]}),
    ];

    expect(followUpQuestionsIn(activities)).toEqual(['New?']);
  });

  it('finds none among other activities', () => {
    expect(followUpQuestionsIn([activity('citations', {questions: [{text: 'Not me'}]})])).toEqual(
      []
    );
    expect(followUpQuestionsIn([])).toEqual([]);
  });

  it('finds none when the payload breaks the contract', () => {
    const broken = [
      {questions: 'nope'},
      {questions: [{text: ''}]},
      {questions: [{label: 'no text'}]},
      {},
    ];

    for (const payload of broken) {
      expect(followUpQuestionsIn([activity(FOLLOW_UP_QUESTIONS_KIND, payload)])).toEqual([]);
    }
  });

  it('finds none when the event came empty', () => {
    expect(followUpQuestionsIn([activity(FOLLOW_UP_QUESTIONS_KIND, {questions: []})])).toEqual([]);
  });
});
