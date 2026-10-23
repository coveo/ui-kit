import {describe, expect, it} from 'vitest';
import type {Activity, Turn} from '@coveo/thermidor';
import {makeTurn} from '../../test/turn-fixtures.js';
import {splitTurn, startFollowUp} from './turn-segments.js';

function activity(id: string): Activity {
  return {id, kind: 'a2ui-surface', replace: false, payload: {}};
}

function turnWith(messages: string[], steps: number, activityIds: string[]): Turn {
  return makeTurn({
    id: 'turn-1',
    response: {
      activities: activityIds.map(activity),
      agent: {
        messages: messages.map((content) => ({content, role: 'assistant'})),
        reasoningSteps: Array.from({length: steps}, (_, i) => ({
          type: 'reasoning' as const,
          content: `step ${i}`,
        })),
      },
    },
  });
}

describe('startFollowUp', () => {
  it('records how much the turn holds when the follow-up is sent', () => {
    const turn = turnWith(['First answer'], 2, ['a1']);

    expect(startFollowUp(turn, ['turn-1/agent-a'], 'Show more life jackets')).toEqual({
      prompt: 'Show more life jackets',
      activityCount: 1,
      messageCount: 1,
      reasoningStepCount: 2,
      surfaceCount: 1,
    });
  });

  it('records no prompt for a search option', () => {
    const turn = turnWith([], 0, []);

    expect(startFollowUp(turn, [], undefined)).not.toHaveProperty('prompt');
  });

  it('counts nothing on a turn without an agent answer', () => {
    const turn = makeTurn({id: 'turn-1'});

    expect(startFollowUp(turn, [], 'Follow up')).toMatchObject({
      messageCount: 0,
      reasoningStepCount: 0,
    });
  });
});

describe('splitTurn', () => {
  it('keeps a turn without follow-ups whole', () => {
    const turn = turnWith(['Answer'], 1, ['a1']);

    const segments = splitTurn(turn, ['turn-1/agent-a'], []);

    expect(segments).toHaveLength(1);
    expect(segments[0].prompt).toBeUndefined();
    expect(segments[0].surfaceIds).toEqual(['turn-1/agent-a']);
    expect(segments[0].response.agent?.messages.map((m) => m.content)).toEqual(['Answer']);
  });

  it('draws what arrived after each follow-up as its own exchange', () => {
    const before = turnWith(['First answer'], 2, ['a1']);
    const followUp = startFollowUp(before, ['turn-1/agent-a'], 'Show more life jackets');
    const after = turnWith(['First answer', 'Second answer'], 5, ['a1', 'a2']);

    const segments = splitTurn(after, ['turn-1/agent-a', 'turn-1/agent-b'], [followUp]);

    expect(segments.map((segment) => segment.prompt)).toEqual([
      undefined,
      'Show more life jackets',
    ]);
    expect(segments.map((segment) => segment.surfaceIds)).toEqual([
      ['turn-1/agent-a'],
      ['turn-1/agent-b'],
    ]);
    expect(
      segments.map((segment) => segment.response.agent?.messages.map((m) => m.content))
    ).toEqual([['First answer'], ['Second answer']]);
    expect(segments.map((segment) => segment.response.agent?.reasoningSteps.length)).toEqual([
      2, 3,
    ]);
    expect(segments.map((segment) => segment.response.activities.map((a) => a.id))).toEqual([
      ['a1'],
      ['a2'],
    ]);
  });
});
