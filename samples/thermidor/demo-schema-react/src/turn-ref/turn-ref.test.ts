import type {Activity} from '@coveo/thermidor';
import {describe, expect, it} from 'vitest';
import {TURN_REF_KIND, turnRefIn} from './turn-ref.js';

const activity = (kind: string, payload: Record<string, unknown>): Activity => ({
  id: '',
  kind,
  replace: false,
  payload,
});

const turnRef = {conversation_id: 'thread-1', turn_id: 'invocation-1', request_id: 'run-1'};

describe('turnRefIn', () => {
  it("reads the turn's IDs", () => {
    expect(turnRefIn([activity(TURN_REF_KIND, turnRef)])).toEqual(turnRef);
  });

  it('drops fields it does not know', () => {
    expect(turnRefIn([activity(TURN_REF_KIND, {...turnRef, other: 1})])).toEqual(turnRef);
  });

  it('finds none among other activities', () => {
    expect(turnRefIn([activity('FollowUpQuestions', turnRef)])).toBeUndefined();
    expect(turnRefIn([])).toBeUndefined();
  });

  it('finds none when the payload breaks the contract', () => {
    const broken = [{...turnRef, turn_id: ''}, {conversation_id: 'thread-1'}, {}];

    for (const payload of broken) {
      expect(turnRefIn([activity(TURN_REF_KIND, payload)])).toBeUndefined();
    }
  });
});
